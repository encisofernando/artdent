<?php

namespace App\Http\Middleware\Concerns;

use App\Models\Tenant;
use App\Support\CrmMode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

trait BootstrapsTenantFromSession
{
    protected function bootstrapTenantFromSession(Request $request): void
    {
        if (CrmMode::isOwner()) {
            return;
        }

        // Rutas como auth:customer (API stateful de e-commerce) sólo tienen
        // sesión cuando Sanctum reconoce el Origin/Referer del request como
        // "de confianza" (ver config/sanctum.php "stateful"). Un cliente sin
        // ese header — o que no matchea la lista — nunca pasa por
        // StartSession, y $request->session() explota con "Session store
        // not set on request". Esta lógica es de tenant de STAFF (guard
        // "web"); si no hay sesión, simplemente no hay nada que bootstrapear.
        if (! $request->hasSession()) {
            return;
        }

        $tenantId = $request->session()->get('tenant_id');

        if (! $tenantId) {
            $this->clearTenantSession($request);

            return;
        }

        $tenant = Tenant::find($tenantId);

        if (! $tenant || ! $tenant->isActive()) {
            $this->clearTenantSession($request, forgetTenantId: true);

            return;
        }

        tenancy()->initialize($tenant);

        if (app()->bound('auth')) {
            auth()->forgetUser();
        }
    }

    protected function clearTenantSession(Request $request, bool $forgetTenantId = false): void
    {
        if (CrmMode::isOwner()) {
            return;
        }

        if (tenancy()->initialized) {
            tenancy()->end();
        }

        Auth::guard('web')->logout();

        if ($forgetTenantId) {
            $request->session()->forget('tenant_id');
        }

        $request->session()->remove('login_web_'.sha1('web'));
        $request->session()->remove('password_hash_web');
    }
}
