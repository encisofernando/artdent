<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Plan extends Model
{
    // Always query central DB even when tenancy is initialized
    protected $connection = 'central';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'price',
        'trial_days',
        'is_active',
        'is_public',
        'mp_plan_id',
        'max_users',
        'max_products',
        'max_sales_per_month',
        'max_chat_messages_per_month',
        'features',
    ];

    protected $casts = [
        'price' => 'float',
        'trial_days' => 'integer',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'max_users' => 'integer',
        'max_products' => 'integer',
        'max_sales_per_month' => 'integer',
        'max_chat_messages_per_month' => 'integer',
        'features' => 'array',
    ];

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TenantSubscription::class);
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'plan_modules');
    }
}
