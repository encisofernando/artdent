<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    // Mercado Pago Configuration
    'mercadopago' => [
        'public_key' => env('MP_PUBLIC_KEY'),
        'access_token' => env('MP_ACCESS_TOKEN'),
        'production' => env('MP_PRODUCTION', false),
        'webhook_secret' => env('MP_WEBHOOK_SECRET'),
    ],

    // Stripe Configuration
    'stripe' => [
        'public_key' => env('STRIPE_PUBLIC_KEY'),
        'secret_key' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
    ],

    // Google Services
    'google' => [
        'analytics' => [
            'measurement_id' => env('GA4_MEASUREMENT_ID'),
            'api_secret' => env('GA4_API_SECRET'),
        ],
        'maps' => [
            'api_key' => env('GOOGLE_MAPS_API_KEY'),
        ],
    ],

    // Facebook/Meta
    'facebook' => [
        'pixel_id' => env('FB_PIXEL_ID'),
        'access_token' => env('FB_ACCESS_TOKEN'),
        'app_id' => env('FB_APP_ID'),
        'app_secret' => env('FB_APP_SECRET'),
    ],

    // Hotjar
    'hotjar' => [
        'site_id' => env('HOTJAR_SITE_ID'),
    ],

    // Tawk.to (Live Chat)
    'tawk' => [
        'property_id' => env('TAWK_PROPERTY_ID'),
        'widget_id' => env('TAWK_WIDGET_ID'),
    ],

    // SendGrid
    'sendgrid' => [
        'api_key' => env('SENDGRID_API_KEY'),
    ],

    // Mailchimp
    'mailchimp' => [
        'api_key' => env('MAILCHIMP_API_KEY'),
        'list_id' => env('MAILCHIMP_LIST_ID'),
        'server_prefix' => env('MAILCHIMP_SERVER_PREFIX', 'us1'),
    ],

    // Firebase (Push Notifications)
    'firebase' => [
        'server_key' => env('FIREBASE_SERVER_KEY'),
        'sender_id' => env('FIREBASE_SENDER_ID'),
        'api_key' => env('FIREBASE_API_KEY'),
        'project_id' => env('FIREBASE_PROJECT_ID'),
    ],

    // Cloudinary (Image CDN)
    'cloudinary' => [
        'cloud_name' => env('CLOUDINARY_CLOUD_NAME'),
        'api_key' => env('CLOUDINARY_API_KEY'),
        'api_secret' => env('CLOUDINARY_API_SECRET'),
    ],

    // AWS S3 (File Storage)
    's3' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'bucket' => env('AWS_BUCKET'),
        'url' => env('AWS_URL'),
        'endpoint' => env('AWS_ENDPOINT'),
    ],

    // Algolia (Search)
    'algolia' => [
        'app_id' => env('ALGOLIA_APP_ID'),
        'api_key' => env('ALGOLIA_API_KEY'),
        'admin_key' => env('ALGOLIA_ADMIN_KEY'),
        'index' => env('ALGOLIA_INDEX', 'products'),
    ],

    // SMS Providers
    'twilio' => [
        'sid' => env('TWILIO_SID'),
        'token' => env('TWILIO_TOKEN'),
        'from' => env('TWILIO_FROM'),
    ],

    // Shipping Providers (Argentina)
    'shipping' => [
        'andreani' => [
            'api_key' => env('ANDREANI_API_KEY'),
            'client_id' => env('ANDREANI_CLIENT_ID'),
        ],
        'correo_argentino' => [
            'api_key' => env('CORREO_ARGENTINO_API_KEY'),
        ],
        'oca' => [
            'api_key' => env('OCA_API_KEY'),
        ],
    ],

];
