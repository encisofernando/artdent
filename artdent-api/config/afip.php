<?php

return [
    'env' => env('AFIP_ENV', 'homologacion'),
    'cuit' => env('AFIP_CUIT', ''),
    'cert' => env('AFIP_CERT_PATH', storage_path('afip/cert.crt')),
    'key'  => env('AFIP_KEY_PATH', storage_path('afip/key.key')),
    'wsaa_url' => env('AFIP_WSAA_URL', 'https://wsaahomo.afip.gov.ar/ws/services/LoginCms'),
    'wsfe_url' => env('AFIP_WSFE_URL', 'https://wswhomo.afip.gov.ar/wsfev1/service.asmx'),
    'default_pv' => env('AFIP_POS', 1),
    'qr_base' => env('AFIP_QR_BASE', 'https://www.afip.gob.ar/fe/qr/?p='),
];
