<?php

namespace App\Http\Middleware;

use App\Models\PublicTokenRegistry;
use App\Models\Tenant;
use App\Support\CrmMode;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Resuelve e inicializa la tenancy para rutas públicas identificadas por un
 * token en la URL (/q/{token} presupuestos, /portal/{token} clientes) —
 * llegan sin sesión de staff, así que no hay forma de saber a qué tenant
 * pertenecen salvo consultando el registro central por el token mismo.
 * Mismo patrón que InitializeTenancyByIsupAccount.
 */
class InitializeTenancyByPublicToken
{
    public function handle(Request $request, Closure $next): Response
    {
        if (CrmMode::isOwner()) {
            // Instancia standalone: una sola BD, no hace falta resolver nada.
            return $next($request);
        }

        $token = (string) $request->route('token', '');

        if ($token === '') {
            abort(404);
        }

        $registry = PublicTokenRegistry::where('token', $token)->first();

        if (! $registry) {
            abort(404);
        }

        $tenant = Tenant::find($registry->tenant_id);

        if (! $tenant || ! $tenant->isActive()) {
            abort(404);
        }

        tenancy()->initialize($tenant);

        return $next($request);
    }
}
