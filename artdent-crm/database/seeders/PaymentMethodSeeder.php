<?php

namespace Database\Seeders;

use App\Models\PaymentMethod;
use Illuminate\Database\Seeder;

/**
 * Sin esto, un tenant nuevo arranca con payment_methods vacío: toda venta
 * queda con payment_method_id=null (fallback silencioso en
 * SaleController::resolveSalePaymentMethod), lo que rompe el agrupado por
 * medio de pago y el cálculo de efectivo esperado en el cierre de caja
 * (ver CashSessionController::buildReport). Mismo set que ya usaba
 * fer_artdent, cargado a mano en su momento.
 */
class PaymentMethodSeeder extends Seeder
{
    public function run(): void
    {
        if (PaymentMethod::query()->exists()) {
            return;
        }

        $methods = [
            ['name' => 'Efectivo', 'type' => 'cash', 'applies_to' => 'ecommerce,pos,lab'],
            ['name' => 'Transferencia Bancaria', 'type' => 'transfer', 'applies_to' => 'ecommerce,pos,lab'],
            ['name' => 'Débito', 'type' => 'card_debit', 'applies_to' => 'pos,lab'],
            ['name' => 'Crédito 1 cuota', 'type' => 'card_credit', 'applies_to' => 'pos,lab'],
            ['name' => 'MercadoPago', 'type' => 'mp', 'applies_to' => 'ecommerce,pos'],
            ['name' => 'Cheque', 'type' => 'check', 'applies_to' => 'lab'],
        ];

        foreach ($methods as $method) {
            PaymentMethod::create([...$method, 'surcharge_pct' => 0, 'is_active' => true]);
        }
    }
}
