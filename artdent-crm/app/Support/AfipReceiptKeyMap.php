<?php

namespace App\Support;

/**
 * Mapa de receipt_type (formato legacy A/B/C y nuevo FA/FB/FC, más NC/ND)
 * → receipt_key que espera AfipService::generateFromSale(). Compartido
 * entre SaleController::store() (auto-factura al confirmar el cobro) y
 * NavePosPaymentController::applyApprovedIntent() (auto-factura al
 * confirmarse un pago QR que quedó diferido).
 */
class AfipReceiptKeyMap
{
    private const MAP = [
        'A' => 'FA', 'FA' => 'FA',
        'B' => 'FB', 'FB' => 'FB',
        'C' => 'FC', 'FC' => 'FC',
        'NCA' => 'NCA', 'NCB' => 'NCB', 'NCC' => 'NCC',
        'NDA' => 'NDA', 'NDB' => 'NDB', 'NDC' => 'NDC',
    ];

    public static function keyFor(?string $receiptType): ?string
    {
        return self::MAP[$receiptType] ?? null;
    }
}
