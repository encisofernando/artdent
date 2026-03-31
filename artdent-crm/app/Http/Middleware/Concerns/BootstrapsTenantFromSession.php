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
