<?php

namespace App\Http\Middleware;

use App\Models\Dentist;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

/**
 * Guarda de sesión para el portal del odontólogo. Si no hay sesión activa, intenta
 * restablecerla automáticamente con la cookie "recordarme" (dentist_remember) antes
 * de mandar al login.
 */
class DentistPortalAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->session()->has('dentist_id')) {
            return $next($request);
        }

        $remembered = $this->attemptRememberLogin($request);

        if (! $remembered) {
            return redirect()->route('dentist-portal.login');
        }

        return $next($request);
    }

    private function attemptRememberLogin(Request $request): bool
    {
        $cookie = $request->cookie('dentist_remember');

        if (! $cookie || ! str_contains($cookie, '|')) {
            return false;
        }

        [$dentistId, $token] = explode('|', $cookie, 2);

        $dentist = Dentist::where('id', $dentistId)
            ->where('is_active', true)
            ->whereNotNull('remember_token')
            ->first();

        if (! $dentist || ! Hash::check($token, $dentist->remember_token)) {
            return false;
        }

        $request->session()->regenerate();
        $request->session()->put('dentist_id', $dentist->id);

        return true;
    }
}
