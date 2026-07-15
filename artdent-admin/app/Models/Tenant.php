<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'email',
            'status',
            'plan',
            'trial_ends_at',
            'activated_at',
            'mp_customer_id',
            'checkout_url',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class, 'tenant_id');
    }

    public function userMaps(): HasMany
    {
        return $this->hasMany(UserTenantMap::class, 'tenant_id');
    }

    public function tenantModules(): HasMany
    {
        return $this->hasMany(TenantModule::class, 'tenant_id');
    }

    public function activeSubscription(): ?Subscription
    {
        return $this->subscriptions()->where('status', 'authorized')->latest()->first();
    }

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'activated_at' => 'datetime',
        'data' => 'array',
    ];

    public function isActive(): bool
    {
        return in_array($this->status, ['trial', 'active']);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->whereIn('status', ['active', 'trial']);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'trial' => 'Período de prueba',
            'active' => 'Activo',
            'suspended' => 'Suspendido',
            'cancelled' => 'Cancelado',
            default => $this->status,
        };
    }

    public function getPlanLabelAttribute(): string
    {
        return match ($this->plan) {
            'starter' => 'Starter',
            'pro' => 'Pro',
            'enterprise' => 'Enterprise',
            default => ucfirst($this->plan),
        };
    }
}
