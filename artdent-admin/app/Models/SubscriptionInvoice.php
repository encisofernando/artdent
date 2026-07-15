<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubscriptionInvoice extends Model
{
    protected $fillable = [
        'tenant_id',
        'tenant_subscription_id',
        'mp_payment_id',
        'receipt_type',
        'point_sale',
        'number',
        'cae',
        'cae_expiry',
        'recipient_name',
        'recipient_cuit',
        'description',
        'subtotal',
        'tax_amount',
        'total',
        'status',
        'environment',
        'afip_request',
        'afip_response',
        'afip_observations',
        'afip_error_msg',
        'issued_at',
    ];

    protected $casts = [
        'afip_request' => 'array',
        'afip_response' => 'array',
        'cae_expiry' => 'date',
        'issued_at' => 'datetime',
        'subtotal' => 'float',
        'tax_amount' => 'float',
        'total' => 'float',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class, 'tenant_subscription_id');
    }
}
