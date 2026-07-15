<?php

namespace App\Support;

use App\Models\Tenant;
use App\Models\UserTenantMap;

/**
 * Resuelve a qué tenant pertenece un email, replicando el mismo criterio que
 * LoginRequest::authenticate() (user_tenant_map -> Tenant activo). Cualquier
 * flujo que necesite operar sobre la base de un usuario ANTES de que haya una
 * sesión con tenant ya inicializado (ej. "olvidé mi contraseña") debe resolver
 * el tenant así, en vez de depender de tenant.session (que sólo lee de la
 * sesión y por eso no sirve para un usuario que todavía no pudo loguearse).
 */
class TenantEmailResolver
{
    public static function resolve(string $email): ?Tenant
    {
        $map = UserTenantMap::query()->where('email', $email)->first();

        if (! $map) {
            return null;
        }

        $tenant = Tenant::find($map->tenant_id);

        if (! $tenant || ! $tenant->isActive()) {
            return null;
        }

        return $tenant;
    }
}
