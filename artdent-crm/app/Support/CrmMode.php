<?php

namespace App\Support;

use Illuminate\Support\Carbon;
use Throwable;

class CrmMode
{
    public static function isOwner(): bool
    {
        return config('crm.mode') === 'owner';
    }

    public static function isMultiTenant(): bool
    {
        return ! static::isOwner();
    }

    public static function billingEnabled(): bool
    {
        return (bool) config('crm.billing_enabled', true);
    }

    public static function ownerTenant(): array
    {
        $tenant = config('crm.owner_tenant', []);

        return [
            'id' => (string) ($tenant['id'] ?? 'owner'),
            'name' => (string) ($tenant['name'] ?? config('app.name', 'ArtDent CRM')),
            'email' => filled($tenant['email'] ?? null) ? (string) $tenant['email'] : null,
            'plan' => (string) ($tenant['plan'] ?? 'owner'),
            'status' => (string) ($tenant['status'] ?? 'active'),
            'trial_ends_at' => static::normalizeDate($tenant['trial_ends_at'] ?? null),
            'activated_at' => static::normalizeDate($tenant['activated_at'] ?? null),
        ];
    }

    public static function tenantInfo(): ?array
    {
        if (static::isOwner()) {
            return static::ownerTenant();
        }

        if (! function_exists('tenant') || ! tenancy()->initialized) {
            return null;
        }

        $tenant = tenant();

        if (! $tenant) {
            return null;
        }

        return [
            'id' => (string) $tenant->getTenantKey(),
            'name' => $tenant->name ?? null,
            'email' => $tenant->email ?? null,
            'plan' => $tenant->plan ?? null,
            'status' => $tenant->status ?? null,
            'trial_ends_at' => static::normalizeDate($tenant->trial_ends_at ?? null),
            'activated_at' => static::normalizeDate($tenant->activated_at ?? null),
        ];
    }

    private static function normalizeDate(mixed $value): ?string
    {
        if (blank($value)) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->toISOString();
        }

        try {
            return Carbon::parse($value)->toISOString();
        } catch (Throwable) {
            return is_scalar($value) ? (string) $value : null;
        }
    }
}
