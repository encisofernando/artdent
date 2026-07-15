<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Comprobantes AFIP que ArtCode le emite al tenant por su suscripción SaaS.
 * Tabla central, gestionada desde artdent-admin (App\Services\Afip\SubscriptionInvoiceService) —
 * acá sólo se lee, nunca se escribe.
 */
class SubscriptionInvoice extends Model
{
    protected $connection = 'central';

    protected $casts = [
        'afip_request' => 'array',
        'afip_response' => 'array',
        'cae_expiry' => 'date',
        'issued_at' => 'datetime',
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'total' => 'float',
    ];
}
