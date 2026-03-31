<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantSubscription extends Model
{
    // Always query central DB even when tenancy is initialized
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id', 'plan_id', 'mp_preapproval_id',
        'status', 'next_payment_date', 'amount', 'mp_data',
    ];

    protected $casts = [
        'next_payment_date' => 'datetime',
        'amount' => 'float',
        'mp_data' => 'array',
    ];

    public function plan(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }
}
