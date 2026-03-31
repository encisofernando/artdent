<?php

namespace App\Http\Middleware;

use App\Http\Middleware\Concerns\BootstrapsTenantFromSession;
use App\Support\UserLanding;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated extends \Illuminate\Auth\Middleware\RedirectIfAuthenticated
{
    use BootstrapsTenantFromSession;

    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $this->bootstrapTenantFromSession($request);

        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return redirect($this->redirectTo($request) ?? $this->defaultRedirectUri());
            }
        }

        return $next($request);
    }

    protected function defaultRedirectUri(): string
    {
        return UserLanding::uriFor(Auth::user());
    }
}
