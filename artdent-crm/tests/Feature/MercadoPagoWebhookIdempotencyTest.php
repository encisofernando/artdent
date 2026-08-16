<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderItem;
use App\Models\Product;
use App\Models\Stock;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * Mercado Pago puede reintentar la entrega del mismo webhook (o el usuario
 * puede recargar la página de retorno, que también dispara una consulta) —
 * dos llamadas para el mismo pago no deberían acreditar stock ni loyalty
 * dos veces. PaymentController::webhook() ya se protege comparando
 * $currentStatus antes de aplicar la acreditación; este test confirma que
 * eso funciona de punta a punta contra un pedido real.
 */
class MercadoPagoWebhookIdempotencyTest extends TestCase
{
    use RefreshesTenantSchema;

    public function test_receiving_the_same_approved_payment_webhook_twice_only_credits_stock_once(): void
    {
        Queue::fake();

        $company = Company::factory()->create();

        // ECOMMERCE_WAREHOUSE_ID por defecto es 1 — se fuerza acá para que
        // matchee lo que el controller realmente usa.
        $warehouse = new Warehouse(['company_id' => $company->id, 'name' => 'Depósito E-commerce', 'code' => 'ECOM', 'is_active' => true]);
        $warehouse->id = 1;
        $warehouse->save();

        $product = Product::create([
            'company_id' => $company->id,
            'name' => 'Producto e-commerce',
            'slug' => 'producto-ecommerce-'.uniqid(),
            'price' => 1000,
            'track_stock' => true,
            'is_active' => true,
        ]);

        Stock::create(['product_id' => $product->id, 'warehouse_id' => $warehouse->id, 'quantity' => 10]);

        $order = EcommerceOrder::create([
            'company_id' => $company->id,
            'order_number' => 'ORD-'.uniqid(),
            'status' => 'pending',
            'payment_status' => 'pending',
            'total' => 2000,
        ]);

        EcommerceOrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 2,
            'unit_price' => 1000,
            'total' => 2000,
        ]);

        Http::fake([
            'api.mercadopago.com/v1/payments/*' => Http::response([
                'status' => 'approved',
                'external_reference' => $order->order_number,
            ], 200),
        ]);

        $payload = ['type' => 'payment', 'data' => ['id' => 'mp-payment-123']];

        // Primera entrega del webhook: acredita.
        $this->postJson(route('api.payment.mp.webhook'), $payload)->assertOk();

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertEquals(8, (float) Stock::where('product_id', $product->id)->value('quantity'));
        $this->assertSame(1, CrmNotification::where('order_code', $order->order_number)->count());

        // Segunda entrega del mismo webhook (reintento de MP o refresh del
        // usuario): no debe volver a descontar stock ni duplicar la
        // notificación — el pedido ya estaba 'paid'.
        $this->postJson(route('api.payment.mp.webhook'), $payload)->assertOk();

        $order->refresh();
        $this->assertSame('paid', $order->payment_status);
        $this->assertEquals(8, (float) Stock::where('product_id', $product->id)->value('quantity'));
        $this->assertSame(1, CrmNotification::where('order_code', $order->order_number)->count());
    }
}
