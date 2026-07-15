<?php

namespace App\Http\Middleware;

use App\Exceptions\ModuleNotEnabledException;
use App\Support\TenantModuleResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModuleEnabled
{
    /**
     * Acepta una lista de slugs separados por "|" con semántica OR (mismo
     * criterio que la middleware `permission:` de spatie) — ej.
     * `module:laboratorio|rrhh` pasa si el tenant tiene cualquiera de los dos.
     */
    public function handle(Request $request, Closure $next, string $slug): Response
    {
        $slugs = explode('|', $slug);
        $resolver = app(TenantModuleResolver::class);

        if (! collect($slugs)->contains(fn (string $s) => $resolver->has($s))) {
            throw new ModuleNotEnabledException($slugs[0]);
        }

        return $next($request);
    }
}
