<?php
// config/cors.php
// Reemplaza el cors.php existente.

return [

    /*
    |--------------------------------------------------------------------------
    | Rutas que aplican CORS
    |--------------------------------------------------------------------------
    */
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
        'user',
        // Si tenés rutas de password reset:
        'forgot-password',
        'reset-password',
    ],

    /*
    |--------------------------------------------------------------------------
    | Métodos permitidos
    |--------------------------------------------------------------------------
    */
    'allowed_methods' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Orígenes permitidos
    |--------------------------------------------------------------------------
    | ⚠️  NUNCA usar '*' cuando supports_credentials = true.
    |     El browser lo rechaza por seguridad.
    |
    | Agregar aquí el dominio del front en producción:
    |   env('FRONTEND_URL', 'https://app.artdent.com')
    */
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:3000',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'https://pos.artdent.com.ar',
        'https://shop.artdent.com.ar',
    ],

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Headers permitidos
    |--------------------------------------------------------------------------
    */
    'allowed_headers' => ['*'],

    /*
    |--------------------------------------------------------------------------
    | Headers expuestos al browser
    |--------------------------------------------------------------------------
    */
    'exposed_headers' => [],

    /*
    |--------------------------------------------------------------------------
    | Max Age del preflight cache (en segundos)
    |--------------------------------------------------------------------------
    */
    'max_age' => 0,

    /*
    |--------------------------------------------------------------------------
    | CRÍTICO: credentials = true para que el browser envíe las cookies
    |--------------------------------------------------------------------------
    */
    'supports_credentials' => true,

];
