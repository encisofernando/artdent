<?php

declare(strict_types=1);

namespace App\Models;

use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase;

    protected $connection = 'central';

    public function getConnectionName(): string
    {
        return 'central';
    }

    public function subscriptions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(TenantSubscription::class, 'tenant_id');
    }

    public function activeSubscription(): ?TenantSubscription
    {
        return $this->subscriptions()->where('status', 'authorized')->latest()->first();
    }

    /**
     * Columns stored directly in the tenants table (not in the data JSON).
     */
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
        ];
    }

    public function isActive(): bool
    {
        return in_array($this->status, ['trial', 'active']);
    }

    public function scopeActive(\Illuminate\Database\Eloquent\Builder $query): \Illuminate\Database\Eloquent\Builder
    {
        return $query->whereIn('status', ['active', 'trial']);
    }
}
