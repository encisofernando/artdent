<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyMove;
use App\Models\LoyaltyReward;
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
    public function balanceFor(Customer $customer): int
    {
        return (int) (LoyaltyAccount::where('customer_id', $customer->id)->value('balance') ?? 0);
    }

    /**
     * Valida si una recompensa se puede canjear para este cliente y este
     * total de compra (pre-descuento) — saldo de puntos suficiente y, si
     * hay un tope configurado, que el descuento de la recompensa no supere
     * ese % del total. No debita nada, solo valida — pensado para que los
     * controllers (POS y checkout) rechacen el canje ANTES de crear la
     * venta/pedido, con el total real pre-descuento (una vez creada la
     * venta/pedido, el total ya viene descontado y no sirve para este
     * chequeo). Devuelve null si es válida, o un mensaje de error si no.
     */
    public function validateRedemption(Customer $customer, LoyaltyReward $reward, float $preDiscountTotal): ?string
    {
        if ($reward->points_cost > $this->balanceFor($customer)) {
            return 'El cliente no tiene saldo de puntos suficiente.';
        }

        $settings = LoyaltySetting::forCompany($reward->company_id);
        if ($settings->max_redemption_percentage
            && $reward->discount_amount > $preDiscountTotal * $settings->max_redemption_percentage / 100) {
            return 'Esta recompensa no se puede aplicar a una compra de este monto.';
        }

        return null;
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

        $redeemedOnThis = $this->pesosRedeemedOn('sale', $sale->id);

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

        $redeemedOnThis = $this->pesosRedeemedOn('ecommerce_order', $order->id);

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

            // redeemedOnThis son los pesos ya descontados por una recompensa
            // canjeada sobre esta misma venta/pedido — no se acredita puntos
            // sobre plata que el cliente ya pagó con puntos.
            $base = max(0.0, $total - $redeemedOnThis);
            $amount = (int) floor($base * $settings->accrual_percentage / 100);
            if ($amount <= 0) {
                return;
            }

            $newBalance = $account->balance + $amount;

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
     * Canje de una recompensa como medio de pago en una venta POS. Debita
     * $reward->points_cost puntos y devuelve $reward->discount_amount (el
     * descuento en pesos que el caller aplica al total). El controller ya
     * debería haber validado con validateRedemption() antes de llegar acá
     * con el total pre-descuento real — este método solo revalida el saldo
     * como defensa adicional (mismo criterio que la doble-idempotencia de
     * accrue()).
     */
    public function redeemForSale(Sale $sale, LoyaltyReward $reward, ?int $userId): float
    {
        if (! $sale->customer) {
            throw new RuntimeException('El canje de puntos requiere un cliente identificado.');
        }

        return $this->redeem($sale->customer, $sale->company_id, $reward, 'sale', $sale->id, "Canje venta POS {$sale->sale_number}: {$reward->name}", $userId);
    }

    /**
     * Canje de una recompensa como descuento en el checkout online.
     */
    public function redeemForOrder(EcommerceOrder $order, LoyaltyReward $reward, ?int $userId = null): float
    {
        if (! $order->customer) {
            throw new RuntimeException('El canje de puntos requiere un cliente identificado.');
        }

        return $this->redeem($order->customer, $order->company_id, $reward, 'ecommerce_order', $order->id, "Canje pedido {$order->order_number}: {$reward->name}", $userId);
    }

    private function redeem(Customer $customer, int $companyId, LoyaltyReward $reward, string $referenceType, int $referenceId, string $description, ?int $userId): float
    {
        return DB::transaction(function () use ($customer, $companyId, $reward, $referenceType, $referenceId, $description, $userId): float {
            $account = LoyaltyAccount::firstOrCreate(
                ['customer_id' => $customer->id],
                ['company_id' => $companyId, 'balance' => 0]
            );
            $account = LoyaltyAccount::whereKey($account->id)->lockForUpdate()->first();

            if ($reward->points_cost > $account->balance) {
                throw new RuntimeException('El cliente no tiene saldo de puntos suficiente.');
            }

            $newBalance = $account->balance - $reward->points_cost;

            $move = LoyaltyMove::create([
                'loyalty_account_id' => $account->id,
                'company_id' => $companyId,
                'user_id' => $userId,
                'loyalty_reward_id' => $reward->id,
                'type' => LoyaltyMove::TYPE_REDEMPTION,
                'amount' => -$reward->points_cost,
                'balance_after' => $newBalance,
                'description' => $description,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'move_date' => now()->toDateString(),
            ]);

            $account->applyMove($move);

            return (float) $reward->discount_amount;
        });
    }

    /**
     * Pesos ya descontados por una recompensa canjeada sobre esta misma
     * venta/pedido — usado por accrue() para no acreditar puntos sobre
     * plata que el cliente ya pagó con puntos. A diferencia de sumar
     * LoyaltyMove.amount directo (que hoy son puntos, no pesos), hay que
     * resolver el discount_amount de la recompensa real vinculada al move.
     */
    private function pesosRedeemedOn(string $referenceType, int $referenceId): float
    {
        return (float) LoyaltyMove::where('reference_type', $referenceType)
            ->where('reference_id', $referenceId)
            ->where('type', LoyaltyMove::TYPE_REDEMPTION)
            ->join('loyalty_rewards', 'loyalty_rewards.id', '=', 'loyalty_moves.loyalty_reward_id')
            ->sum('loyalty_rewards.discount_amount');
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
