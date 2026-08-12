<?php

namespace App\Http\Middleware;

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Symfony\Component\HttpFoundation\Cookie;

/**
 * Igual que VerifyCsrfToken, pero en panel.artdent.com.ar (portal_only) usa
 * cookie/header propios en vez de los nombres estándar
 * "XSRF-TOKEN"/"X-XSRF-TOKEN".
 *
 * pos.artdent.com.ar tiene SESSION_DOMAIN=.artdent.com.ar (wildcard) — su
 * cookie XSRF-TOKEN le llega también a panel.artdent.com.ar (subdominio
 * hermano). Si panel usa el mismo nombre de cookie (aunque con dominio más
 * acotado), el navegador termina con DOS cookies "XSRF-TOKEN" simultáneas
 * y axios/Inertia puede leer la equivocada al armar el header — eso
 * producía 419 intermitentes en panel según cuál de las dos se leyera en
 * cada request. Con un nombre propio la ambigüedad desaparece del todo.
 *
 * Este middleware reemplaza a ValidateCsrfToken en TODO el grupo "web"
 * (pos.artdent.com.ar incluido) porque config('crm.portal_only') todavía no
 * está disponible cuando bootstrap/app.php arma los middlewares — la
 * decisión se toma acá adentro, en tiempo de request, cuando config() ya
 * funciona. Con portal_only=false (pos.artdent.com.ar) delega 100% al
 * comportamiento estándar heredado, sin ningún cambio de conducta.
 */
class PortalVerifyCsrfToken extends VerifyCsrfToken
{
    public const COOKIE_NAME = 'PORTAL-XSRF-TOKEN';

    public const HEADER_NAME = 'X-PORTAL-XSRF-TOKEN';

    protected function getTokenFromRequest($request)
    {
        if (! config('crm.portal_only')) {
            return parent::getTokenFromRequest($request);
        }

        $token = $request->input('_token') ?: $request->header('X-CSRF-TOKEN');

        if (! $token && $header = $request->header(self::HEADER_NAME)) {
            try {
                $token = CookieValuePrefix::remove($this->encrypter->decrypt($header, static::serialized()));
            } catch (DecryptException) {
                $token = '';
            }
        }

        return $token;
    }

    protected function newCookie($request, $config)
    {
        if (! config('crm.portal_only')) {
            return parent::newCookie($request, $config);
        }

        return new Cookie(
            self::COOKIE_NAME,
            $request->session()->token(),
            $this->availableAt(60 * $config['lifetime']),
            $config['path'],
            $config['domain'],
            $config['secure'],
            false,
            false,
            $config['same_site'] ?? null,
            $config['partitioned'] ?? false
        );
    }

    public static function serialized()
    {
        if (! config('crm.portal_only')) {
            return parent::serialized();
        }

        return EncryptCookies::serialized(self::COOKIE_NAME);
    }
}
