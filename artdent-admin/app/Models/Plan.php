<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'price',
        'trial_days',
        'is_active',
        'is_public',
        'mp_plan_id',
        'mp_init_point',
        'max_users',
        'max_products',
        'max_sales_per_month',
        'max_chat_messages_per_month',
        'features',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'trial_days' => 'integer',
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'max_users' => 'integer',
        'max_products' => 'integer',
        'max_sales_per_month' => 'integer',
        'max_chat_messages_per_month' => 'integer',
        'features' => 'array',
    ];

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function modules(): BelongsToMany
    {
        return $this->belongsToMany(Module::class, 'plan_modules');
    }

    public function getFormattedPriceAttribute(): string
    {
        return '$'.number_format((float) $this->price, 0, ',', '.').' ARS/mes';
    }
}
