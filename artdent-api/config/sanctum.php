<?php
// config/sanctum.php
// Reemplaza el archivo que generó php artisan vendor:publish --tag=sanctum-config

use Laravel\Sanctum\Sanctum;

return [

    /*
    |--------------------------------------------------------------------------
    | Stateful Domains (SPA con cookie session)
    |--------------------------------------------------------------------------
    | Estos son los dominios desde donde tu React puede hacer requests
    | "stateful" (con cookie de sesión) en lugar de Bearer token.
    |
    | En local: localhost:5173 (Vite dev server)
    | En producción: el dominio de tu front SPA
    |
    | ⚠️  No incluir http:// ni https://
    */
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', implode(',', [
        'localhost',
        'localhost:3000',
        'localhost:5173',   // ← Vite dev server
        'localhost:4173',   // ← Vite preview
        '127.0.0.1',
        '127.0.0.1:8000',
        // En producción, agregar en .env:
        // SANCTUM_STATEFUL_DOMAINS=app.artdent.com
    ]))),

    /*
    |--------------------------------------------------------------------------
    | Sanctum Guards
    |--------------------------------------------------------------------------
    */
    'guard' => ['web'],

    /*
    |--------------------------------------------------------------------------
    | Expiración de tokens (solo aplica a Bearer tokens, no a cookies)
    |--------------------------------------------------------------------------
    | null = no expiran (solo para API tokens de terceros)
    */
    'expiration' => null,

    /*
    |--------------------------------------------------------------------------
    | Token prefix
    |--------------------------------------------------------------------------
    */
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    */
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],

];
