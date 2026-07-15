<?php

namespace App\Observers;

use App\Support\TenantModuleResolver;
use Illuminate\Database\Eloquent\Model;

/**
 * Invalida la caché de módulos habilitados (TenantModuleResolver) cuando
 * cambia una suscripción o un override de tenant_modules DESDE ESTE proceso
 * (ej. SubscriptionController@cancel). Registrado tanto para TenantSubscription
 * como para TenantModule — ambos exponen tenant_id.
 *
 * No cubre escrituras hechas desde artdent-admin (webhook de MercadoPago,
 * backoffice) — para eso el resolver usa un TTL corto de caché como red
 * de seguridad (ver TenantModuleResolver).
 */
class TenantModuleCacheObserver
{
    public function saved(Model $model): void
    {
        $this->forget($model);
    }

    public function deleted(Model $model): void
    {
        $this->forget($model);
    }

    private function forget(Model $model): void
    {
        if ($tenantId = $model->tenant_id) {
            app(TenantModuleResolver::class)->forget((string) $tenantId);
        }
    }
}
