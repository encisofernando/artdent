<?php

namespace App\Services;

use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\Sale;
use App\Models\SalePayment;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SalePaymentService
{
    public function __construct(private readonly CustomerAccountSaleAllocator $allocator) {}

    /**
     * Registra un cobro (parcial o total) sobre una venta, actualiza
     * paid_amount/status y acredita la cuenta corriente del cliente si
     * corresponde. Extraído de SaleController::pay() para que el mismo
     * código lo use tanto el cobro manual como la confirmación automática
     * de un pago QR/link de Nave (webhook) — un solo camino de negocio,
     * sin duplicar la lógica de asignación de pagos.
     *
     * @throws RuntimeException si el monto no es válido contra el saldo pendiente
     */
    public function registerPayment(
        Sale $sale,
        float $amount,
        ?int $paymentMethodId = null,
        ?string $description = null,
    ): SalePayment {
        $remainingAmount = $this->allocator->outstandingAmount($sale);

        if ($remainingAmount <= 0.0) {
            throw new RuntimeException('La venta ya no tiene saldo pendiente.');
        }

        if ($amount > $remainingAmount + 0.009) {
            throw new RuntimeException('El monto supera el saldo pendiente del comprobante.');
        }

        return DB::transaction(function () use ($sale, $amount, $paymentMethodId, $description) {
            $paymentReference = null;

            if ($sale->customer_id) {
                $account = CustomerAccount::firstOrCreate(
                    ['customer_id' => $sale->customer_id],
                    ['balance' => 0]
                );

                $newBalance = $account->balance - $amount;
                $move = CustomerAccountMove::create([
                    'customer_account_id' => $account->id,
                    'user_id' => auth()->id(),
                    'type' => CustomerAccountMove::TYPE_PAYMENT,
                    'amount' => $amount,
                    'balance_after' => $newBalance,
                    'description' => $description ?? "Pago venta {$sale->sale_number}",
                    'payment_method_id' => $paymentMethodId,
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'move_date' => now()->toDateString(),
                ]);
                $account->applyMove($move);

                $paymentReference = $this->allocator->salePaymentReference($move, $sale);
            }

            $payment = SalePayment::create([
                'sale_id' => $sale->id,
                'payment_method_id' => $paymentMethodId,
                'amount' => $amount,
                'reference' => $paymentReference,
                'paid_at' => now(),
            ]);

            $this->allocator->syncSale($sale, round((float) $sale->paid_amount + $amount, 2));

            return $payment;
        });
    }
}
