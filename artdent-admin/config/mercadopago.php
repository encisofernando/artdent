<?php

return [
    'public_key' => env('MP_PUBLIC_KEY'),
    'access_token' => env('MP_ACCESS_TOKEN'),

    /*
     * URL que MercadoPago llamará al cambiar el estado de una suscripción.
     * En producción: https://admin.artdent.com.ar/webhooks/mercadopago
     */
    'webhook_url' => env('APP_URL').'/webhooks/mercadopago',
];
