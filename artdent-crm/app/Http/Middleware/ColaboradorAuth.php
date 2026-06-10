<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ColaboradorAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->has('colaborador_id')) {
            return redirect()->route('colaboradores.login');
        }

        return $next($request);
    }
}
