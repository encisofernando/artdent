<?php

namespace App\Http\Middleware;

use App\Http\Middleware\Concerns\BootstrapsTenantFromSession;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InitializeTenancyBySession
{
    use BootstrapsTenantFromSession;

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->bootstrapTenantFromSession($request);

        return $next($request);
    }
}
