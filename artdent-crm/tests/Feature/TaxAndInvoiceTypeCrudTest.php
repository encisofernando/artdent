<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\InvoiceType;
use App\Models\Product;
use App\Models\Tax;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * TaxController/InvoiceTypeController estaban vacíos (stubs de
 * make:controller) pese a estar conectados a rutas reales — invoices.
 * invoice_type_id es NOT NULL, así que sin un CRUD real esos tipos sólo
 * podían existir por seed/insert manual (Fase 10).
 */
class TaxAndInvoiceTypeCrudTest extends TestCase
{
    use RefreshesTenantSchema;

    protected function setUp(): void
    {
        parent::setUp();

        $company = Company::factory()->create();
        $user = User::factory()->for($company)->create();
        $user->givePermissionTo(Permission::findOrCreate('settings.edit', 'web'));

        $this->actingAs($user);
    }

    public function test_tax_full_crud(): void
    {
        $this->postJson(route('taxs.store'), [
            'name' => 'IVA 21%',
            'rate' => 21,
            'afip_code' => '5',
            'is_active' => true,
        ])->assertOk()->assertJson(['success' => true]);

        $tax = Tax::where('name', 'IVA 21%')->firstOrFail();

        $this->getJson(route('taxs.index'))
            ->assertOk()
            ->assertJsonFragment(['id' => $tax->id, 'name' => 'IVA 21%']);

        $this->putJson(route('taxs.update', $tax), [
            'name' => 'IVA 21% (actualizado)',
            'rate' => 21,
            'afip_code' => '5',
            'is_active' => true,
        ])->assertOk();

        $this->assertSame('IVA 21% (actualizado)', $tax->fresh()->name);

        $this->deleteJson(route('taxs.destroy', $tax))->assertOk();
        $this->assertModelMissing($tax);
    }

    public function test_tax_in_use_by_a_product_cannot_be_deleted(): void
    {
        $tax = Tax::create(['name' => 'IVA 10.5%', 'rate' => 10.5, 'afip_code' => '4', 'is_active' => true]);

        Product::create([
            'name' => 'Producto con IVA',
            'slug' => 'producto-con-iva-'.uniqid(),
            'price' => 100,
            'tax_id' => $tax->id,
            'is_active' => true,
        ]);

        $this->deleteJson(route('taxs.destroy', $tax))
            ->assertStatus(422)
            ->assertJson(['success' => false]);

        $this->assertModelExists($tax);
    }

    public function test_invoice_type_full_crud(): void
    {
        $this->postJson(route('invoice-types.store'), [
            'name' => 'Factura B',
            'afip_code' => '6',
            'is_active' => true,
        ])->assertOk()->assertJson(['success' => true]);

        $invoiceType = InvoiceType::where('name', 'Factura B')->firstOrFail();

        $this->getJson(route('invoice-types.index'))
            ->assertOk()
            ->assertJsonFragment(['id' => $invoiceType->id, 'afip_code' => '6']);

        $this->putJson(route('invoice-types.update', $invoiceType), [
            'name' => 'Factura B (actualizado)',
            'afip_code' => '6',
            'is_active' => false,
        ])->assertOk();

        $this->assertFalse($invoiceType->fresh()->is_active);

        $this->deleteJson(route('invoice-types.destroy', $invoiceType))->assertOk();
        $this->assertModelMissing($invoiceType);
    }

    public function test_afip_code_is_required_on_invoice_type(): void
    {
        $this->postJson(route('invoice-types.store'), [
            'name' => 'Sin código AFIP',
            'is_active' => true,
        ])->assertStatus(422)->assertJsonValidationErrors('afip_code');
    }
}
