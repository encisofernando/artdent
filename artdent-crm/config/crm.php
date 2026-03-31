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
        'name' => env('CRM_OWNER_TENANT_NAME', env('APP_NAME', 'ArtDent CRM')),
        'email' => env('CRM_OWNER_TENANT_EMAIL'),
        'plan' => env('CRM_OWNER_TENANT_PLAN', 'owner'),
        'status' => env('CRM_OWNER_TENANT_STATUS', 'active'),
        'trial_ends_at' => env('CRM_OWNER_TENANT_TRIAL_ENDS_AT'),
        'activated_at' => env('CRM_OWNER_TENANT_ACTIVATED_AT'),
    ],

];
