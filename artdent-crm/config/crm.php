<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CRM Deployment Mode
    |--------------------------------------------------------------------------
    |
    | multi_tenant: uses the central SaaS database plus tenant resolution.
    | owner: runs as a standalone owner instance on its own application DB.
    |
    */

    'mode' => env('CRM_MODE', 'multi_tenant'),

    /*
    |--------------------------------------------------------------------------
    | Portal-only deployment (portal de odontólogos)
    |--------------------------------------------------------------------------
    |
    | Cuando está prendido, este deploy sirve EXCLUSIVAMENTE el portal de
    | odontólogos (panel.artdent.com.ar) — misma base de datos y mismo
    | codebase que la instancia CRM normal (pos.artdent.com.ar), sólo cambia
    | qué se expone en la raíz del sitio. Ver routes/web.php.
    |
    */

    'portal_only' => filter_var(env('PORTAL_ONLY', false), FILTER_VALIDATE_BOOL),

    /*
    |--------------------------------------------------------------------------
    | Billing
    |--------------------------------------------------------------------------
    |
    | Billing is disabled automatically for owner instances unless explicitly
    | enabled. This keeps legacy owner deployments away from plan checkout
    | and recurring payment flows.
    |
    */

    'billing_enabled' => filter_var(
        env('CRM_BILLING_ENABLED', env('CRM_MODE', 'multi_tenant') === 'owner' ? 'false' : 'true'),
        FILTER_VALIDATE_BOOL
    ),

    /*
    |--------------------------------------------------------------------------
    | Owner Instance Tenant Metadata
    |--------------------------------------------------------------------------
    |
    | Used only when CRM_MODE=owner. This lets the app expose plan/status
    | information without requiring the central SaaS tables.
    |
    */

    'owner_tenant' => [
        'id' => env('CRM_OWNER_TENANT_ID', 'owner'),
        'name' => env('CRM_OWNER_TENANT_NAME', env('APP_NAME', 'ArtCode CRM')),
        'email' => env('CRM_OWNER_TENANT_EMAIL'),
        'plan' => env('CRM_OWNER_TENANT_PLAN', 'owner'),
        'status' => env('CRM_OWNER_TENANT_STATUS', 'active'),
        'trial_ends_at' => env('CRM_OWNER_TENANT_TRIAL_ENDS_AT'),
        'activated_at' => env('CRM_OWNER_TENANT_ACTIVATED_AT'),
    ],

];
