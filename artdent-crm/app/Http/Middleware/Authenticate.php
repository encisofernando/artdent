<?php

namespace App\Http\Middleware;

use App\Http\Middleware\Concerns\BootstrapsTenantFromSession;
use Closure;
use Illuminate\Contracts\Auth\Factory as Auth;

class Authenticate extends \Illuminate\Auth\Middleware\Authenticate
{
    use BootstrapsTenantFromSession;

    public function __construct(Auth $auth)
    {
        parent::__construct($auth);
    }

    public function handle($request, Closure $next, ...$guards)
    {
        $this->bootstrapTenantFromSession($request);

        return parent::handle($request, $next, ...$guards);
    }

    protected function unauthenticated($request, array $guards)
    {
        parent::unauthenticated($request, $guards);
    }

    protected function redirectTo($request): ?string
    {
        if ($request->expectsJson()) {
            return null;
        }

        // En panel.artdent.com.ar (portal_only) no existen las rutas de
        // staff (routes/auth.php no se carga, ver routes/web.php) — mandar
        // acá a un visitante sin sesión de staff a route('login') explota
        // con RouteNotFoundException. Se lo manda al login del portal, que
        // es lo único que existe en ese deploy.
        if (config('crm.portal_only')) {
            return route('dentist-portal.login');
        }

        return route('login');
    }
}
