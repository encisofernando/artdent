<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    // Always query central DB even when tenancy is initialized
    protected $connection = 'central';

    protected $fillable = ['slug', 'name', 'description', 'price', 'trial_days', 'is_active', 'is_public', 'mp_plan_id', 'features'];

    protected $casts = [
        'price' => 'float',
        'trial_days' => 'integer',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'features' => 'array',
    ];

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }
}
