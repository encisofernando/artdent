<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Entorno activo
    |--------------------------------------------------------------------------
    | 'homo' → homologación (testing), 'prod' → producción
    | Se puede sobreescribir por empresa desde la tabla companies.
    */
    'environment' => env('AFIP_ENVIRONMENT', 'homo'),

    /*
    |--------------------------------------------------------------------------
    | WSAA — Web Service de Autenticación y Autorización
    |--------------------------------------------------------------------------
    */
    'wsaa' => [
        'homo' => [
            'wsdl' => env(
                'AFIP_WSAA_HOMO_WSDL',
                storage_path('afip_wsdl/wsaa_homo.wsdl')
            ),
        ],
        'prod' => [
            'wsdl' => env(
                'AFIP_WSAA_PROD_WSDL',
                storage_path('afip_wsdl/wsaa_prod.wsdl')
            ),
        ],
        'service' => 'wsfe',         // Servicio al que se solicita acceso
        'ttl_seconds' => 43200,      // 12 horas
    ],

    /*
    |--------------------------------------------------------------------------
    | WSFEv1 — Facturación Electrónica (Mercado Interno)
    |--------------------------------------------------------------------------
    */
    'wsfev1' => [
        'homo' => [
            'wsdl' => env(
                'AFIP_WSFEV1_HOMO_WSDL',
                storage_path('afip_wsdl/wsfev1_homo.wsdl')
            ),
        ],
        'prod' => [
            'wsdl' => env(
                'AFIP_WSFEV1_PROD_WSDL',
                storage_path('afip_wsdl/wsfev1_prod.wsdl')
            ),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Padrón A5 — ws_sr_constancia_inscripcion
    |--------------------------------------------------------------------------
    */
    'padron' => [
        'homo' => [
            'wsdl' => env(
                'AFIP_PADRON_HOMO_WSDL',
                'https://awshomo.afip.gov.ar/sr-padron/webservices/personaServiceA5?wsdl'
            ),
        ],
        'prod' => [
            'wsdl' => env(
                'AFIP_PADRON_PROD_WSDL',
                'https://aws.afip.gov.ar/sr-padron/webservices/personaServiceA5?wsdl'
            ),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Cadenas de certificación CA
    |--------------------------------------------------------------------------
    */
    'ca_chains' => [
        'homo' => storage_path('afip_certs/chains/homo_chain.pem'),
        'prod' => storage_path('afip_certs/chains/prod_chain.pem'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Directorio base para certificados de empresas
    |--------------------------------------------------------------------------
    */
    'certs_dir' => storage_path('afip_certs'),

    /*
    |--------------------------------------------------------------------------
    | Tipos de comprobante AFIP → código numérico
    |--------------------------------------------------------------------------
    */
    'receipt_types' => [
        'FA' => 1,   // Factura A
        'NCA' => 2,  // Nota de Crédito A
        'NDA' => 3,  // Nota de Débito A
        'FB' => 6,   // Factura B
        'NCB' => 7,  // Nota de Crédito B
        'NDB' => 8,  // Nota de Débito B
        'FC' => 11,  // Factura C
        'NCC' => 12, // Nota de Crédito C
        'NDC' => 13, // Nota de Débito C
    ],

    /*
    |--------------------------------------------------------------------------
    | Alícuotas IVA → código AFIP
    |--------------------------------------------------------------------------
    */
    'iva_rates' => [
        0 => 3,    // IVA 0%
        10.5 => 4,    // IVA 10.5%
        21 => 5,    // IVA 21%
        27 => 6,    // IVA 27%
        5 => 8,    // IVA 5%
        2.5 => 9,    // IVA 2.5%
    ],

    /*
    |--------------------------------------------------------------------------
    | Tipo de documento del receptor
    |--------------------------------------------------------------------------
    */
    'doc_types' => [
        'CUIT' => 80,
        'CUIL' => 86,
        'CDI' => 87,
        'DNI' => 96,
        'Sin Doc' => 99, // Consumidor Final
    ],

    /*
    |--------------------------------------------------------------------------
    | Límite monto para Consumidor Final sin identificar (RG 4290-E art. 5 inc. b)
    |--------------------------------------------------------------------------
    | Por encima de este valor el DNI del receptor es obligatorio.
    */
    'cf_identification_limit' => env('AFIP_CF_LIMIT', 10_000_000),
];
