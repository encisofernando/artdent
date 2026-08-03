<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyMove;
use App\Models\LoyaltySetting;
use App\Models\Sale;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Puntos de fidelización — un solo ledger (LoyaltyAccount + LoyaltyMove) por
 * Customer, compartido entre el POS (Sale) y el e-commerce (EcommerceOrder)
 * porque ambos canales corren contra el mismo backend/tenant. El company_id
 * de cada movimiento se toma siempre del propio Sale/EcommerceOrder — nunca
 * de CompanyContext::id(), que depende de sesión/usuario autenticado y no es
 * confiable dentro de un webhook de pago sin sesión.
 */
class LoyaltyService
{
    public function balanceFor(Customer $customer): float
    {
        return (float) (LoyaltyAccount::where('customer_id', $customer->id)->value('balance') ?? 0);
    }

    /**
     * Acredita puntos para una venta POS ya completamente paga. Idempotente:
     * un mismo Sale nunca acredita dos veces (constraint único sobre
     * reference_type+reference_id+type), aunque se llame más de una vez
     * (ej. una vez al crearse si se paga entero, y otra vez si más tarde se
     * reintenta la liquidación de un saldo pendiente).
     */
    public function accrueForSale(Sale $sale): void
    {
        if (! $sale->customer_id || $sale->status !== 'completed') {
            return;
        }

        $settings = LoyaltySetting::forCompany($sale->company_id);
        if (! $settings->is_enabled) {
            return;
        }

        if ($settings->min_purchase_amount && (float) $sale->total < $settings->min_purchase_amount) {
            return;
        }

        $redeemedOnThis = (float) LoyaltyMove::where('reference_type', 'sale')
            ->where('reference_id', $sale->id)
            ->where('type', LoyaltyMove::TYPE_REDEMPTION)
            ->sum('amount');

        $this->accrue(
            customer: $sale->customer,
            companyId: $sale->company_id,
            total: (float) $sale->total,
            redeemedOnThis: $redeemedOnThis,
            referenceType: 'sale',
            referenceId: $sale->id,
            description: "Venta POS {$sale->sale_number}",
            settings: $settings,
        );
    }

    /**
     * Acredita puntos para un pedido online ya pago. Resuelve (o crea) el
     * Customer del pedido si llegó como checkout invitado.
     */
    public function accrueForOrder(EcommerceOrder $order): void
    {
        $settings = LoyaltySetting::forCompany($order->company_id);
        if (! $settings->is_enabled) {
            return;
        }

        if ($settings->min_purchase_amount && (float) $order->total < $settings->min_purchase_amount) {
            return;
        }

        $customer = $this->resolveOrCreateCustomerForOrder($order);
        if (! $customer) {
            return;
        }

        $redeemedOnThis = (float) LoyaltyMove::where('reference_type', 'ecommerce_order')
            ->where('reference_id', $order->id)
            ->where('type', LoyaltyMove::TYPE_REDEMPTION)
            ->sum('amount');

        $this->accrue(
            customer: $customer,
            companyId: $order->company_id,
            total: (float) $order->total,
            redeemedOnThis: $redeemedOnThis,
            referenceType: 'ecommerce_order',
            referenceId: $order->id,
            description: "Pedido online {$order->order_number}",
            settings: $settings,
        );
    }

    private function accrue(
        Customer $customer,
        int $companyId,
        float $total,
        float $redeemedOnThis,
        string $referenceType,
        int $referenceId,
        string $description,
        LoyaltySetting $settings,
    ): void {
        DB::transaction(function () use ($customer, $companyId, $total, $redeemedOnThis, $referenceType, $referenceId, $description, $settings): void {
            $account = LoyaltyAccount::firstOrCreate(
                ['customer_id' => $customer->id],
                ['company_id' => $companyId, 'balance' => 0]
            );
            $account = LoyaltyAccount::whereKey($account->id)->lockForUpdate()->first();

            $alreadyAccrued = LoyaltyMove::where('reference_type', $referenceType)
                ->where('reference_id', $referenceId)
                ->where('type', LoyaltyMove::TYPE_ACCRUAL)
                ->exists();
            if ($alreadyAccrued) {
                return;
            }

            // redeemedOnThis ya viene negativo (es un TYPE_REDEMPTION).
            $base = max(0.0, round($total + $redeemedOnThis, 2));
            $amount = round($base * $settings->accrual_percentage / 100, 2);
            if ($amount <= 0.0) {
                return;
            }

            $newBalance = round($account->balance + $amount, 2);

            try {
                $move = LoyaltyMove::create([
                    'loyalty_account_id' => $account->id,
                    'company_id' => $companyId,
                    'user_id' => auth()->id(),
                    'type' => LoyaltyMove::TYPE_ACCRUAL,
                    'amount' => $amount,
                    'balance_after' => $newBalance,
                    'description' => $description,
                    'reference_type' => $referenceType,
                    'reference_id' => $referenceId,
                    'move_date' => now()->toDateString(),
                ]);
            } catch (QueryException $e) {
                if (str_contains($e->getMessage(), 'loyalty_moves_reference_unique')) {
                    return;
                }
                throw $e;
            }

            $account->applyMove($move);
        });
    }

    /**
     * Canje de puntos como medio de pago en una venta POS.
     */
    public function redeemForSale(Sale $sale, float $amount, ?int $userId): LoyaltyMove
    {
        if (! $sale->customer) {
            throw new RuntimeException('El canje de puntos requiere un cliente identificado.');
        }

        return $this->redeem($sale->customer, $sale->company_id, $amount, 'sale', $sale->id, "Canje venta POS {$sale->sale_number}", $userId);
    }

    /**
     * Canje de puntos como descuento en el checkout online.
     */
    public function redeemForOrder(EcommerceOrder $order, float $amount, ?int $userId = null): LoyaltyMove
    {
        if (! $order->customer) {
            throw new RuntimeException('El canje de puntos requiere un cliente identificado.');
        }

        return $this->redeem($order->customer, $order->company_id, $amount, 'ecommerce_order', $order->id, "Canje pedido {$order->order_number}", $userId);
    }

    private function redeem(Customer $customer, int $companyId, float $amount, string $referenceType, int $referenceId, string $description, ?int $userId): LoyaltyMove
    {
        return DB::transaction(function () use ($customer, $companyId, $amount, $referenceType, $referenceId, $description, $userId): LoyaltyMove {
            $account = LoyaltyAccount::firstOrCreate(
                ['customer_id' => $customer->id],
                ['company_id' => $companyId, 'balance' => 0]
            );
            $account = LoyaltyAccount::whereKey($account->id)->lockForUpdate()->first();

            if ($amount > $account->balance + 0.009) {
                throw new RuntimeException('El cliente no tiene saldo de puntos suficiente.');
            }

            $newBalance = round($account->balance - $amount, 2);

            $move = LoyaltyMove::create([
                'loyalty_account_id' => $account->id,
                'company_id' => $companyId,
                'user_id' => $userId,
                'type' => LoyaltyMove::TYPE_REDEMPTION,
                'amount' => -$amount,
                'balance_after' => $newBalance,
                'description' => $description,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'move_date' => now()->toDateString(),
            ]);

            $account->applyMove($move);

            return $move;
        });
    }

    /**
     * Checkout invitado: matchea por guest_email/guest_dni dentro de la
     * misma empresa (igual criterio que AuthApiController::linkGuestOrders())
     * y crea un Customer "cáscara" (sin password) si no existe todavía —
     * se completa cuando el cliente se registra (ver ajuste en
     * AuthApiController::register()).
     */
    private function resolveOrCreateCustomerForOrder(EcommerceOrder $order): ?Customer
    {
        if ($order->customer_id) {
            return $order->customer;
        }

        $email = $order->guest_email ? strtolower(trim($order->guest_email)) : null;
        $dni = $order->guest_dni ?: null;
        if (! $email && ! $dni) {
            return null;
        }

        $customer = Customer::withoutCompanyScope()
            ->where('company_id', $order->company_id)
            ->where(function ($query) use ($email, $dni): void {
                if ($email) {
                    $query->orWhereRaw('LOWER(email) = ?', [$email]);
                }
                if ($dni) {
                    $query->orWhere('dni', $dni);
                }
            })
            ->first();

        if (! $customer) {
            $customer = Customer::withoutCompanyScope()->create([
                'company_id' => $order->company_id,
                'name' => $order->shipping_name ?: 'Cliente e-commerce',
                'email' => $email,
                'dni' => $dni,
                'password' => null,
                'is_active' => true,
            ]);
        }

        $order->forceFill(['customer_id' => $customer->id])->save();

        return $customer;
    }
}
