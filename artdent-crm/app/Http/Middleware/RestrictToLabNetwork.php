<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RestrictToLabNetwork
{
    public function handle(Request $request, Closure $next): Response
    {
        // Allow access via secret kiosk token (query param or header)
        $kioskToken = config('app.kiosk_token');
        if ($kioskToken && $this->hasValidToken($request, $kioskToken)) {
            return $next($request);
        }

        // Allow access from configured IP ranges
        $allowed = array_filter(array_map('trim', explode(',', config('app.lab_allowed_ips', '127.0.0.1,::1'))));
        $clientIp = $request->ip();

        foreach ($allowed as $allowedIp) {
            if ($this->ipMatches($clientIp, $allowedIp)) {
                return $next($request);
            }
        }

        return response()->json(['error' => 'Acceso solo permitido desde la red del laboratorio.'], 403);
    }

    private function hasValidToken(Request $request, string $kioskToken): bool
    {
        $token = $request->query('token') ?? $request->header('X-Kiosk-Token') ?? '';

        return hash_equals($kioskToken, $token);
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
