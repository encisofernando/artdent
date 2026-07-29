<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Protege las rutas /internal/isup/* — sólo debe poder llamarlas el proceso
 * isup-listener (Node.js) corriendo en el mismo VPS, nunca un terminal ni
 * ningún cliente externo. A diferencia del webhook ISAPI (público, lo llama
 * el terminal directo), acá el único "cliente" legítimo es un proceso interno
 * de confianza, autenticado con un token estático compartido.
 */
class EnsureIsupInternalToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $expected = config('services.isup_listener.token');
        $provided = $request->bearerToken();

        if (! $expected || ! $provided || ! hash_equals($expected, $provided)) {
            abort(401, 'Token interno inválido.');
        }

        return $next($request);
    }
}
