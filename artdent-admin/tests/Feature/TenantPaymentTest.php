<?php

namespace Tests\Feature;

use App\Models\AfipIssuerSetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\Tenant;
use App\Models\TenantPayment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class TenantPaymentTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();

        DB::connection('mysql')->beginTransaction();

        $this->user = User::factory()->create();
    }

    protected function tearDown(): void
    {
        DB::connection('mysql')->rollBack();

        parent::tearDown();
    }

    public function test_can_record_manual_payment_via_transfer(): void
    {
        $slug = 'clinica-'.uniqid();
        $this->makeTenantRow($slug);
        $plan = Plan::create([
            'slug' => 'starter-'.uniqid(),
            'name' => 'Starter',
            'price' => 15000,
            'trial_days' => 0,
            'is_active' => true,
            'is_public' => true,
        ]);

        $response = $this->actingAs($this->user)->post(route('payments.store'), [
            'tenant_id' => $slug,
            'plan_id' => $plan->id,
            'payment_method' => 'transfer',
            'amount' => 15000,
            'paid_at' => now()->toDateString(),
            'reference' => 'TRANSF-123456',
            'notes' => 'Pago mensual transferido desde Banco Galicia',
            'extend_subscription' => true,
            'next_payment_date' => now()->addMonth()->toDateString(),
        ]);

        $response->assertRedirect(route('payments.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('tenant_payments', [
            'tenant_id' => $slug,
            'payment_method' => 'transfer',
            'amount' => 15000,
            'reference' => 'TRANSF-123456',
            'status' => 'approved',
        ]);

        $tenant = Tenant::find($slug);
        $this->assertEquals('active', $tenant->status);

        $subscription = Subscription::where('tenant_id', $slug)->first();
        $this->assertNotNull($subscription);
        $this->assertEquals('authorized', $subscription->status);
    }

    public function test_can_record_payment_with_qr_and_cash(): void
    {
        $slug = 'clinica-'.uniqid();
        $this->makeTenantRow($slug);

        // QR
        $this->actingAs($this->user)->post(route('payments.store'), [
            'tenant_id' => $slug,
            'payment_method' => 'qr',
            'amount' => 20000,
            'paid_at' => now()->toDateString(),
            'reference' => 'QR-MP-7890',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tenant_payments', [
            'tenant_id' => $slug,
            'payment_method' => 'qr',
            'amount' => 20000,
        ]);

        // Efectivo
        $this->actingAs($this->user)->post(route('payments.store'), [
            'tenant_id' => $slug,
            'payment_method' => 'cash',
            'amount' => 18000,
            'paid_at' => now()->toDateString(),
            'reference' => 'RECIBO-001',
        ])->assertSessionHasNoErrors();

        $this->assertDatabaseHas('tenant_payments', [
            'tenant_id' => $slug,
            'payment_method' => 'cash',
            'amount' => 18000,
        ]);
    }

    public function test_payment_validation_fails_for_invalid_methods(): void
    {
        $slug = 'clinica-'.uniqid();
        $this->makeTenantRow($slug);

        $response = $this->actingAs($this->user)->post(route('payments.store'), [
            'tenant_id' => $slug,
            'payment_method' => 'invalid_method',
            'amount' => -100,
            'paid_at' => 'no-date',
        ]);

        $response->assertSessionHasErrors(['payment_method', 'amount', 'paid_at']);
    }

    public function test_show_invoice_returns_official_arca_qr_payload(): void
    {
        $slug = 'clinica-'.uniqid();
        $this->makeTenantRow($slug);

        AfipIssuerSetting::create([
            'name' => 'ArtCode SAS',
            'cuit' => '30719444071',
            'iva_condition' => 'responsable_inscripto',
            'point_sale' => 2,
            'environment' => 'homo',
            'auto_invoice' => false,
        ]);

        $invoice = SubscriptionInvoice::create([
            'tenant_id' => $slug,
            'receipt_type' => 'FB',
            'point_sale' => 2,
            'number' => 45,
            'cae' => '74182910293847',
            'cae_expiry' => now()->addDays(10),
            'recipient_name' => 'Clínica Demo',
            'recipient_cuit' => '20304050607',
            'description' => 'Suscripción Plan Pro',
            'subtotal' => 10000,
            'tax_amount' => 2100,
            'total' => 12100,
            'status' => 'authorized',
            'environment' => 'homo',
            'issued_at' => now(),
        ]);

        $response = $this->actingAs($this->user)->getJson(route('invoices.show', $invoice->id));

        $response->assertOk();
        $response->assertJsonStructure([
            'invoice' => ['id', 'number', 'cae', 'total'],
            'issuer' => ['name', 'cuit'],
            'qr_data' => ['ver', 'cuit', 'ptoVta', 'tipoCmp', 'nroCmp', 'importe', 'codAut'],
            'qr_url',
        ]);

        $qrUrl = $response->json('qr_url');
        $this->assertStringStartsWith('https://www.arca.gob.ar/fe/qr/?p=', $qrUrl);
    }

    public function test_can_approve_pending_payment(): void
    {
        $this->makeTenantRow('tenant-approve');

        $payment = TenantPayment::create([
            'tenant_id' => 'tenant-approve',
            'amount' => 15000,
            'payment_method' => 'transfer',
            'reference' => 'TRF-123456',
            'paid_at' => now(),
            'status' => 'pending',
        ]);

        $response = $this->actingAs($this->user)->post(route('payments.approve', $payment->id));

        $response->assertRedirect();
        $this->assertEquals('approved', $payment->fresh()->status);
    }

    protected function makeTenantRow(string $slug): void
    {
        $row = [
            'id' => $slug,
            'name' => 'Tenant '.$slug,
            'plan' => 'starter',
            'status' => 'trial',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('tenants')->insert($row);
        DB::connection('mysql')->table('tenants')->insert($row);
    }
}
