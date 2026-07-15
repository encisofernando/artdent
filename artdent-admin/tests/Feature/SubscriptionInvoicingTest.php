<?php

namespace Tests\Feature;

use App\Models\AfipIssuerSetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Services\Afip\SubscriptionInvoiceService;
use App\Services\MercadoPagoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Tests\TestCase;

/**
 * No se prueba acá el camino feliz completo (auto_invoice=true + AFIP emite
 * CAE real) — WsaaService/WsfevService hacen SoapClient real, no están
 * inyectados/mockeables sin un refactor mayor, y ya se verificó manualmente
 * contra AFIP homologación/producción real (ver memoria del proyecto). Estos
 * tests cubren la lógica que SÍ es segura de probar sin red: validación del
 * emisor, y las ramas del webhook de pago que nunca llegan a tocar AFIP
 * (pago no aprobado, suscripción no resuelta, auto-factura desactivada).
 *
 * `tenants`/`subscriptions` (vía Subscription->tenant) viven en la conexión
 * 'mysql' real — mismo criterio que SignupControllerTest de la Fase 10:
 * inserts directos por query builder (sin Tenant::create(), evita disparar
 * Jobs\CreateDatabase) envueltos en una transacción manual sobre 'mysql'.
 */
class SubscriptionInvoicingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        DB::connection('mysql')->beginTransaction();
    }

    protected function tearDown(): void
    {
        DB::connection('mysql')->rollBack();

        parent::tearDown();
    }

    public function test_service_throws_when_no_issuer_configured(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('No hay una identidad AFIP configurada');

        new SubscriptionInvoiceService;
    }

    public function test_service_throws_when_cert_file_is_missing(): void
    {
        // environment=homo en validIssuerData() -> certPath() resuelve homo_cert_path.
        $issuer = AfipIssuerSetting::create($this->validIssuerData(['homo_cert_path' => '/no/existe.crt']));

        $service = new SubscriptionInvoiceService($issuer);

        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('Certificado AFIP del emisor no encontrado');

        $service->generateForPayment(
            $this->makeTenantModel('acme-'.uniqid()),
            null,
            1000.0,
            'Suscripción de prueba',
        );
    }

    public function test_payment_webhook_ignores_non_approved_payments(): void
    {
        Http::fake([
            'api.mercadopago.com/v1/payments/*' => Http::response(['status' => 'pending'], 200),
        ]);
        Log::spy();

        app(MercadoPagoService::class)->processWebhook([
            'type' => 'payment',
            'data' => ['id' => '123'],
        ]);

        Log::shouldNotHaveReceived('error');
    }

    public function test_payment_webhook_skips_gracefully_when_subscription_not_found(): void
    {
        Http::fake([
            'api.mercadopago.com/v1/payments/*' => Http::response([
                'status' => 'approved',
                'external_reference' => 'no-existe-'.uniqid(),
                'transaction_amount' => 5000,
            ], 200),
        ]);

        app(MercadoPagoService::class)->processWebhook([
            'type' => 'payment',
            'data' => ['id' => '456'],
        ]);

        $this->assertTrue(true); // no exception, no crash
    }

    public function test_payment_webhook_skips_invoicing_when_auto_invoice_disabled(): void
    {
        $slug = 'acme-'.uniqid();
        $this->makeTenantRow($slug);
        $plan = Plan::create(['slug' => 'starter-'.uniqid(), 'name' => 'Starter', 'price' => 5000, 'trial_days' => 0, 'is_active' => true, 'is_public' => true]);

        Subscription::create([
            'tenant_id' => $slug,
            'plan_id' => $plan->id,
            'mp_preapproval_id' => 'pre-'.uniqid(),
            'status' => 'authorized',
            'amount' => 5000,
        ]);

        AfipIssuerSetting::create($this->validIssuerData(['auto_invoice' => false]));

        Http::fake([
            'api.mercadopago.com/v1/payments/*' => Http::response([
                'status' => 'approved',
                'external_reference' => $slug,
                'transaction_amount' => 5000,
            ], 200),
        ]);

        app(MercadoPagoService::class)->processWebhook([
            'type' => 'payment',
            'data' => ['id' => '789'],
        ]);

        $this->assertDatabaseCount('subscription_invoices', 0);
    }

    protected function validIssuerData(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Test Issuer',
            'cuit' => '30719444071',
            'iva_condition' => 'responsable_inscripto',
            'point_sale' => 2,
            'environment' => 'homo',
            'cert_path' => storage_path('app/private/afip_certs/issuer/cert.crt'),
            'homo_cert_path' => storage_path('app/private/afip_certs/issuer/cert_homo.crt'),
            'key_path' => storage_path('app/private/afip_certs/issuer/private.key'),
            'auto_invoice' => false,
        ], $overrides);
    }

    /**
     * `tenant_subscriptions` vive en sqlite (conexión por defecto de test) y
     * su FK a `tenants` sólo la satisface una fila en esa MISMA base — pero
     * `App\Models\Tenant` resuelve siempre contra 'mysql' (real, dinámico vía
     * stancl), así que hace falta la fila en las dos conexiones para que el
     * FK constraint pase Y `Subscription->tenant` devuelva datos reales.
     */
    protected function makeTenantRow(string $slug): void
    {
        $row = [
            'id' => $slug,
            'name' => 'Tenant '.$slug,
            'plan' => 'starter',
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ];

        DB::table('tenants')->insert($row);
        DB::connection('mysql')->table('tenants')->insert($row);
    }

    protected function makeTenantModel(string $slug): Tenant
    {
        $this->makeTenantRow($slug);

        return Tenant::find($slug);
    }
}
