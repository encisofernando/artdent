<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    protected $table = 'tenant_subscriptions';

    protected $fillable = [
        'tenant_id',
        'plan_id',
        'mp_preapproval_id',
        'status',
        'next_payment_date',
        'amount',
        'mp_data',
    ];

    protected $casts = [
        'next_payment_date' => 'datetime',
        'amount' => 'decimal:2',
        'mp_data' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'authorized';
    }
}
