<?php

namespace App\Services;

use App\Models\Company;
use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\Sale;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CustomerAccountPaymentService
{
    public function __construct(
        private readonly CustomerAccountSaleAllocator $allocator,
        private readonly EmailTemplateService $emailTemplateService,
    ) {}

    /**
     * Registra un pago sobre la cuenta corriente de un cliente, actualiza el
     * saldo y opcionalmente lo aplica a un comprobante puntual. Extraído de
     * CustomerAccountController::storePayment() para que el mismo código lo
     * use tanto el cobro manual como la confirmación automática de un pago
     * QR/link de Nave (webhook).
     *
     * @return array{move: CustomerAccountMove, account: CustomerAccount, applied_sales: Collection}
     *
     * @throws RuntimeException si el comprobante indicado no es válido para este cliente
     */
    public function registerPayment(
        Customer $customer,
        int $companyId,
        float $amount,
        ?int $paymentMethodId = null,
        ?int $saleId = null,
        ?string $description = null,
        ?string $moveDate = null,
        bool $sendEmail = false,
    ): array {
        $preferredSale = null;

        if ($saleId) {
            $preferredSale = Sale::query()
                ->whereKey($saleId)
                ->where('customer_id', $customer->id)
                ->where('company_id', $companyId)
                ->first();

            if (! $preferredSale) {
                throw new RuntimeException('El comprobante seleccionado no pertenece a este cliente.');
            }

            if ($this->allocator->outstandingAmount($preferredSale) <= 0.0) {
                throw new RuntimeException('El comprobante seleccionado ya no tiene deuda pendiente.');
            }
        }

        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        [$move, $appliedSales] = DB::transaction(function () use (
            $account,
            $amount,
            $paymentMethodId,
            $description,
            $preferredSale,
            $moveDate,
            $companyId,
        ) {
            $newBalance = $account->balance - $amount;

            $move = CustomerAccountMove::create([
                'customer_account_id' => $account->id,
                'user_id' => auth()->id(),
                'type' => CustomerAccountMove::TYPE_PAYMENT,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'description' => $description
                    ?? ($preferredSale ? "Pago aplicado a {$preferredSale->sale_number}" : 'Pago a cuenta'),
                'reference_type' => $preferredSale ? 'sale' : null,
                'reference_id' => $preferredSale?->id,
                'payment_method_id' => $paymentMethodId,
                'move_date' => $moveDate ?? now()->toDateString(),
            ]);

            $account->applyMove($move);

            $appliedSales = $this->allocator->applyMoveToSales(
                $move,
                $preferredSale,
                $companyId,
                true,
                ! $preferredSale
            );

            return [$move, $appliedSales];
        });

        $move->load('paymentMethod:id,name');
        $account = $account->fresh();

        if ($sendEmail && $customer->email) {
            $company = Company::findOrFail($companyId);

            $this->emailTemplateService->send('payment', $customer->email, $company, [
                'empresa' => $company->fantasy_name ?: $company->name,
                'cliente' => $customer->name,
                'monto' => '$'.number_format($amount, 2, ',', '.'),
                'fecha' => now()->format('d/m/Y'),
                'metodo' => $move->paymentMethod?->name ?? 'Efectivo',
            ]);
        }

        return [
            'move' => $move,
            'account' => $account,
            'applied_sales' => $appliedSales,
        ];
    }
}
