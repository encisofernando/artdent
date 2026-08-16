<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Stock;
use App\Models\User;
use App\Models\Warehouse;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * Camino feliz + adversarial de una venta completa (multi-ítem, descuento,
 * pago parcial y pago completo) — ejercita en un solo flujo real varios de
 * los fixes de la Fase 3 (lockForUpdate en Stock/CustomerAccount, chequeo de
 * stock insuficiente que antes no existía).
 */
class SaleFlowTest extends TestCase
{
    use RefreshesTenantSchema;

    private Company $company;

    private User $user;

    private Warehouse $warehouse;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->user = User::factory()->for($this->company)->create();
        $this->user->givePermissionTo(
            Permission::findOrCreate('sales.create', 'web'),
            Permission::findOrCreate('sales.view', 'web'),
        );

        $this->warehouse = Warehouse::create([
            'company_id' => $this->company->id,
            'name' => 'Depósito Principal',
            'code' => 'DEP-01',
            'is_active' => true,
        ]);

        PaymentMethod::create(['name' => 'Efectivo', 'type' => 'cash', 'is_active' => true]);

        $this->actingAs($this->user);
    }

    private function makeProduct(float $price, float $stockQty): Product
    {
        $product = Product::create([
            'company_id' => $this->company->id,
            'name' => 'Producto '.uniqid(),
            'slug' => 'producto-'.uniqid(),
            'price' => $price,
            'track_stock' => true,
            'is_active' => true,
        ]);

        Stock::create([
            'product_id' => $product->id,
            'warehouse_id' => $this->warehouse->id,
            'quantity' => $stockQty,
        ]);

        return $product;
    }

    public function test_multi_item_sale_with_discount_and_partial_payment_stays_pending(): void
    {
        $productA = $this->makeProduct(price: 1000, stockQty: 10);
        $productB = $this->makeProduct(price: 500, stockQty: 5);
        $customer = Customer::create(['name' => 'Cliente de prueba', 'email' => 'cliente+'.uniqid().'@example.com']);

        // 2x productA ($2000) + 1x productB ($500) - $200 descuento = $2300 total.
        // Se paga $1000 en efectivo, el resto ($1300) a cuenta corriente →
        // la venta debe quedar 'pending' (sólo cuenta paid_amount lo saldado).
        $response = $this->post(route('sales.store'), [
            'items' => [
                ['product_id' => $productA->id, 'name' => $productA->name, 'quantity' => 2, 'unit_price' => 1000, 'discount' => 0, 'total' => 2000],
                ['product_id' => $productB->id, 'name' => $productB->name, 'quantity' => 1, 'unit_price' => 500, 'discount' => 200, 'total' => 300],
            ],
            'subtotal' => 2500,
            'discount_amount' => 200,
            'total' => 2300,
            'customer_id' => $customer->id,
            'payments' => [
                ['method' => 'cash', 'amount' => 1000],
                ['method' => 'cuenta_corriente', 'amount' => 1300],
            ],
            'paid_amount' => 1000,
            'receipt_type' => 'X',
        ]);

        $response->assertOk();

        $sale = \App\Models\Sale::where('company_id', $this->company->id)->firstOrFail();
        $this->assertSame('pending', $sale->status);
        $this->assertEquals(1000.0, (float) $sale->paid_amount);
        $this->assertEquals(2300.0, (float) $sale->total);
        $this->assertCount(2, $sale->sale_items);

        // Stock descontado por cada ítem vendido, sin importar si la venta
        // quedó pending — el stock se descuenta al vender, no al cobrar.
        $this->assertEquals(8, (float) Stock::where('product_id', $productA->id)->value('quantity'));
        $this->assertEquals(4, (float) Stock::where('product_id', $productB->id)->value('quantity'));
    }

    public function test_full_payment_marks_sale_completed(): void
    {
        $product = $this->makeProduct(price: 1000, stockQty: 10);

        $response = $this->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'name' => $product->name, 'quantity' => 1, 'unit_price' => 1000, 'discount' => 0, 'total' => 1000],
            ],
            'total' => 1000,
            'payments' => [['method' => 'cash', 'amount' => 1000]],
            'paid_amount' => 1000,
            'receipt_type' => 'X',
        ]);

        $response->assertOk();

        $sale = \App\Models\Sale::where('company_id', $this->company->id)->firstOrFail();
        $this->assertSame('completed', $sale->status);
    }

    public function test_insufficient_stock_blocks_the_sale_and_leaves_stock_untouched(): void
    {
        $product = $this->makeProduct(price: 1000, stockQty: 1);

        $response = $this->post(route('sales.store'), [
            'items' => [
                ['product_id' => $product->id, 'name' => $product->name, 'quantity' => 5, 'unit_price' => 1000, 'discount' => 0, 'total' => 5000],
            ],
            'total' => 5000,
            'payments' => [['method' => 'cash', 'amount' => 5000]],
            'paid_amount' => 5000,
            'receipt_type' => 'X',
        ]);

        $response->assertSessionHasErrors('items');
        $this->assertSame(0, \App\Models\Sale::where('company_id', $this->company->id)->count());
        $this->assertEquals(1, (float) Stock::where('product_id', $product->id)->value('quantity'));
    }
}
