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

    /**
     * Soporta IP exacta e IP/CIDR para IPv4 y para IPv6 (necesario en la red
     * del consultorio: el ISP asigna IPv6 pública por dispositivo y Android
     * rota el sufijo por las extensiones de privacidad, así que una IP
     * exacta se vence sola — hay que poder cargar el /64 del prefijo, que
     * es estable). `inet_pton` da la representación binaria en ambos casos,
     * así que la comparación de máscara es la misma para las dos familias.
     */
    private function ipMatches(string $clientIp, string $allowed): bool
    {
        if ($clientIp === $allowed) {
            return true;
        }

        if (! str_contains($allowed, '/')) {
            return false;
        }

        [$subnet, $bits] = explode('/', $allowed);
        $bits = (int) $bits;

        $clientBin = @inet_pton($clientIp);
        $subnetBin = @inet_pton($subnet);

        if ($clientBin === false || $subnetBin === false || strlen($clientBin) !== strlen($subnetBin)) {
            return false;
        }

        $fullBytes = intdiv($bits, 8);
        $remainderBits = $bits % 8;

        if ($fullBytes > 0 && strncmp($clientBin, $subnetBin, $fullBytes) !== 0) {
            return false;
        }

        if ($remainderBits === 0) {
            return true;
        }

        $mask = (0xFF << (8 - $remainderBits)) & 0xFF;

        return (ord($clientBin[$fullBytes]) & $mask) === (ord($subnetBin[$fullBytes]) & $mask);
    }
}
