<?php

namespace App\Support;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\TenantModule;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Resuelve qué módulos tiene habilitados el tenant actual: módulos del plan
 * activo, más overrides puntuales en tenant_modules (add-ons habilitados,
 * o revocaciones puntuales con enabled=false).
 *
 * Cachea entre requests vía `Cache::remember()` (TTL corto, ver CACHE_TTL) —
 * esto requiere el store `redis` (Fase 9 — Escalabilidad): `stancl/tenancy`
 * envuelve el facade `Cache` con `CacheTenancyBootstrapper` y fuerza
 * `.tags(...)` en toda llamada mientras hay tenancy inicializada, y el store
 * `database` no soporta tags (`Cache::remember()` revienta con "This cache
 * store does not support tagging." apenas hay un tenant activo). Redis sí
 * soporta tags, así que esto ya no rompe. Además de la caché en Redis, se
 * mantiene una memoización estática en memoria por request para no pegarle
 * a Redis más de una vez por tenant dentro del mismo request.
 */
class TenantModuleResolver
{
    private const CACHE_TTL = 120;

    /** @var array<string, array<int, string>> */
    private static array $requestCache = [];

    /**
     * @return array<int, string>
     */
    public function enabledSlugs(): array
    {
        $tenantId = $this->currentTenantId();

        if (! $tenantId) {
            return [];
        }

        return self::$requestCache[$tenantId] ??= Cache::remember(
            $this->cacheKey($tenantId),
            self::CACHE_TTL,
            fn () => $this->resolve($tenantId)
        );
    }

    public function has(string $slug): bool
    {
        return in_array($slug, $this->enabledSlugs(), true);
    }

    /**
     * Plan activo del tenant actual (o del owner en modo owner). Expuesto
     * para servicios que necesitan leer límites del plan (ej. PlanLimitService)
     * sin duplicar la resolución de tenant/suscripción/plan.
     */
    public function currentPlan(): ?Plan
    {
        $tenantId = $this->currentTenantId();

        return $tenantId ? $this->resolvePlan($tenantId) : null;
    }

    /**
     * Limpia la caché (memoria del request + Redis) para el tenant dado.
     * Llamar tras cualquier cambio que afecte los módulos resueltos (ej.
     * override de módulo, cambio de plan) para no esperar el TTL.
     */
    public function forget(?string $tenantId = null): void
    {
        $tenantId ??= $this->currentTenantId();

        if ($tenantId) {
            unset(self::$requestCache[$tenantId]);
            Cache::forget($this->cacheKey($tenantId));
        }
    }

    private function cacheKey(string $tenantId): string
    {
        return "tenant_modules:{$tenantId}";
    }

    private function currentTenantId(): ?string
    {
        if (CrmMode::isOwner()) {
            return 'owner';
        }

        if (! function_exists('tenant') || ! tenancy()->initialized) {
            return null;
        }

        return (string) tenant('id');
    }

    /**
     * @return array<int, string>
     */
    private function resolve(string $tenantId): array
    {
        $plan = $this->resolvePlan($tenantId);
        $planSlugs = $plan ? $plan->modules()->pluck('slug') : collect();

        if (CrmMode::isOwner()) {
            return $planSlugs->values()->all();
        }

        $overrides = TenantModule::where('tenant_id', $tenantId)
            ->where(function ($query) {
                $query->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->with('module')
            ->get();

        $enabledExtra = $overrides->where('enabled', true)->pluck('module.slug')->filter();
        $disabled = $overrides->where('enabled', false)->pluck('module.slug')->filter();

        return $planSlugs->merge($enabledExtra)->diff($disabled)->unique()->values()->all();
    }

    private function resolvePlan(string $tenantId): ?Plan
    {
        if (CrmMode::isOwner()) {
            return Plan::where('slug', CrmMode::ownerTenant()['plan'])->first();
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant) {
            return null;
        }

        $planSlug = $tenant->activeSubscription()?->plan?->slug ?? $tenant->plan;

        if (! $planSlug) {
            return null;
        }

        $plan = Plan::where('slug', $planSlug)->first();

        if (! $plan) {
            Log::warning("TenantModuleResolver: plan [{$planSlug}] del tenant [{$tenantId}] no existe en la tabla plans.");
        }

        return $plan;
    }
}
