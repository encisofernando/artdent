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

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'browsershot' => [
        'chrome_path' => env('CHROME_PATH', '/usr/bin/google-chrome'),
        'node_binary' => env('NODE_BINARY', '/usr/bin/node'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'mercadopago' => [
        'access_token' => env('MP_ACCESS_TOKEN', ''),
        'ecommerce_url' => env('ECOMMERCE_URL', ''),
        'webhook_secret' => env('MERCADOPAGO_WEBHOOK_SECRET', ''),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', '/'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI', '/'),
    ],

    'whatsapp' => [
        'api_version' => env('WHATSAPP_API_VERSION', 'v21.0'),
        'base_url' => 'https://graph.facebook.com',
    ],

    'chatbot' => [
        'provider' => env('CHATBOT_PROVIDER', 'openai'),
        'openai_key' => env('CHATBOT_OPENAI_API_KEY', env('OPENAI_API_KEY')),
        'openai_model' => env('CHATBOT_OPENAI_MODEL', 'gpt-5.4-nano'),
        'openai_prompt_cache_key' => env('CHATBOT_OPENAI_PROMPT_CACHE_KEY', 'artdent:chatbot:erp:v1'),
        'openai_prompt_cache_retention' => env('CHATBOT_OPENAI_PROMPT_CACHE_RETENTION', 'in_memory'),
    ],

];
