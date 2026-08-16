<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://shop.artdent.com.ar',
        'https://shop.artcode.com.ar',
        'http://localhost:5173',
        'http://localhost:8080',
        'https://localhost:8080',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080',
    ],

    // Túneles de desarrollo local (loca.lt/lhr.life) — con
    // supports_credentials=true, dejar esto activo en producción permite
    // que cualquiera con un túnel en cualquiera de los dos servicios haga
    // requests cross-origin autenticados contra la API real. Sólo tiene
    // sentido en local, donde de hecho se usan para probar webhooks.
    // env() crudo, no app()->environment(): los archivos de config se
    // cargan antes de que el binding 'env' del container exista todavía
    // (LoadConfiguration corre antes que DetectEnvironment resuelto vía
    // container) — app()->environment() acá tira "Class env does not
    // exist" en cada boot, incluida cada request real.
    'allowed_origins_patterns' => env('APP_ENV') === 'local' ? [
        '#^https://[a-z0-9]+\.lhr\.life$#i',
        '#^https://[a-z0-9]+\.loca\.lt$#i',
    ] : [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => true,

];
