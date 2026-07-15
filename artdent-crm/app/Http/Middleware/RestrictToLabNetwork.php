<?php

namespace App\Http\Middleware;

use App\Models\KioskNetwork;
use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Gatea el acceso de terminales físicos (kiosco de fichaje, kiosco de
 * producción) que pegan sin sesión/login, e inicializa la tenancy del
 * tenant dueño de esa IP/token — sin esto, cualquier request a estas rutas
 * cae en la conexión por defecto sin saber a qué tenant pertenece (fuga
 * real entre tenants si más de uno usa kioscos). La resolución primaria es
 * vía `KioskNetwork` (central, IP o token por tenant, autogestionado desde
 * KioskAccessController); el fallback de `.env` (`LAB_ALLOWED_IPS`/
 * `KIOSK_TOKEN`) sólo resuelve tenant si `KIOSK_DEFAULT_TENANT_ID` está
 * configurado — evita que ese fallback (pensado para desarrollo local)
 * inicialice "cualquier tenant" en un despliegue real con varios tenants.
 */
class RestrictToLabNetwork
{
    public function handle(Request $request, Closure $next): Response
    {
        $network = $this->resolveNetwork($request);

        if ($network && ($tenant = Tenant::find($network->tenant_id)) && $tenant->isActive()) {
            tenancy()->initialize($tenant);

            return $next($request);
        }

        if ($this->matchesDevFallback($request) && $defaultTenantId = config('app.kiosk_default_tenant_id')) {
            $tenant = Tenant::find($defaultTenantId);

            if ($tenant && $tenant->isActive()) {
                tenancy()->initialize($tenant);

                return $next($request);
            }
        }

        return response()->json(['error' => 'Acceso solo permitido desde una red de kiosco autorizada.'], 403);
    }

    private function resolveNetwork(Request $request): ?KioskNetwork
    {
        $token = $request->query('token') ?? $request->header('X-Kiosk-Token');

        if ($token) {
            $byToken = KioskNetwork::where('token', $token)->where('is_active', true)->first();

            if ($byToken) {
                return $byToken;
            }
        }

        $clientIp = $request->ip();

        return KioskNetwork::where('is_active', true)
            ->whereNotNull('ip_address')
            ->get()
            ->first(fn (KioskNetwork $n) => $this->ipMatches($clientIp, $n->ip_address));
    }

    /**
     * Fallback de desarrollo local: token/IPs globales de `.env`, sin
     * asociación a ningún tenant en la BD. Sólo tiene efecto si además
     * `KIOSK_DEFAULT_TENANT_ID` está configurado (ver handle()).
     */
    private function matchesDevFallback(Request $request): bool
    {
        $kioskToken = config('app.kiosk_token');
        if ($kioskToken) {
            $token = $request->query('token') ?? $request->header('X-Kiosk-Token') ?? '';
            if (hash_equals($kioskToken, $token)) {
                return true;
            }
        }

        $clientIp = $request->ip();
        $envIps = array_filter(array_map('trim', explode(',', config('app.lab_allowed_ips', '127.0.0.1,::1'))));

        foreach ($envIps as $allowedIp) {
            if ($this->ipMatches($clientIp, $allowedIp)) {
                return true;
            }
        }

        return false;
    }

    private function ipMatches(string $clientIp, string $allowed): bool
    {
        if ($clientIp === $allowed) {
            return true;
        }

        // CIDR support: 192.168.1.0/24
        if (str_contains($allowed, '/')) {
            [$subnet, $bits] = explode('/', $allowed);
            $ip = ip2long($clientIp);
            $sub = ip2long($subnet);
            $mask = -1 << (32 - (int) $bits);

            return ($ip & $mask) === ($sub & $mask);
        }

        return false;
    }
}
