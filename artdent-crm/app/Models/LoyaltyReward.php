<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltyReward extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'points_cost',
        'discount_amount',
        'is_active',
    ];

    protected $casts = [
        'company_id' => 'int',
        'points_cost' => 'integer',
        'discount_amount' => 'float',
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
