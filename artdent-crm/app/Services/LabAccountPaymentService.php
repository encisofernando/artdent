<?php

namespace App\Services;

use App\Models\Dentist;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use Illuminate\Support\Facades\DB;

/**
 * Único punto que registra un pago real en la cuenta corriente de un
 * odontólogo — usado por el alta manual del staff (LabAccountMoveController),
 * la aprobación de un comprobante informado desde el portal, y el cobro
 * online (Nave QR / Mercado Pago). Mismo cálculo de balance en los tres
 * casos, con lock para evitar condiciones de carrera.
 */
class LabAccountPaymentService
{
    public function registerPayment(
        Dentist $dentist,
        float $amount,
        ?int $paymentMethodId,
        ?string $description,
        ?string $moveDate = null,
        ?int $userId = null,
    ): LabAccountMove {
        return DB::transaction(function () use ($dentist, $amount, $paymentMethodId, $description, $moveDate, $userId) {
            $account = LabAccount::lockForUpdate()->firstOrCreate(
                ['dentist_id' => $dentist->id],
                ['balance' => 0]
            );

            $move = new LabAccountMove([
                'lab_account_id' => $account->id,
                'user_id' => $userId ?? auth()->id(),
                'type' => LabAccountMove::TYPE_PAYMENT,
                'amount' => $amount,
                'description' => $description,
                'payment_method_id' => $paymentMethodId,
                'move_date' => $moveDate ?? now()->toDateString(),
            ]);

            $newBalance = $account->balance + $move->signed_amount;
            $move->balance_after = $newBalance;
            $move->save();

            $account->update(['balance' => $newBalance]);

            return $move;
        });
    }
}
