<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateAfipInvoiceJob;
use App\Models\Company;
use App\Models\Sale;
use App\Services\Afip\AfipService;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AfipController extends Controller
{
    /**
     * Genera un comprobante AFIP de forma manual (sin cola).
     * Devuelve JSON para que el frontend pueda mostrar resultado inmediato.
     */
    public function generate(Request $request, Sale $sale)
    {
        $request->validate([
            'receipt_key' => 'required|string|in:FA,NCA,NDA,FB,NCB,NDB,FC,NCC,NDC',
        ]);

        $sale->load(['company', 'sale_items', 'customer']);

        try {
            $service = new AfipService($sale->company);
            $invoice = $service->generateFromSale($sale, $request->receipt_key);

            // Actualizar receipt_type de la venta al tipo AFIP generado
            $sale->update(['receipt_type' => $request->receipt_key]);

            return response()->json([
                'success' => true,
                'invoice' => [
                    'id' => $invoice->id,
                    'cae' => $invoice->cae,
                    'cae_expiry' => $invoice->cae_expiry?->format('d/m/Y'),
                    'number' => $invoice->number,
                    'status' => $invoice->status,
                ],
                'receipt_type' => $request->receipt_key,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Despacha el Job en cola (auto-facturación asíncrona).
     */
    public function dispatch(Request $request, Sale $sale)
    {
        $request->validate([
            'receipt_key' => 'required|string|in:FA,NCA,NDA,FB,NCB,NDB,FC,NCC,NDC',
        ]);

        if ($sale->invoice_id) {
            return response()->json(['success' => false, 'error' => 'La venta ya tiene un comprobante AFIP.'], 422);
        }

        GenerateAfipInvoiceJob::dispatch($sale->id, $request->receipt_key);

        return response()->json(['success' => true, 'message' => 'Solicitud de factura encolada.']);
    }

    /**
     * Sube el certificado (.crt) o la clave privada (.key) de la empresa.
     * El parámetro `env` distingue entre homo y prod para el cert.
     */
    public function uploadCert(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'type' => 'required|in:cert,key',
            'env' => 'nullable|in:homo,prod',
            'file' => 'required|file|extensions:crt,pem,key,txt|max:64',
        ]);

        $companyId = CompanyContext::id();
        $type = $request->type;
        $env = $request->env ?? 'prod';
        $dir = "afip_certs/{$companyId}";

        if ($type === 'cert') {
            $filename = $env === 'homo' ? 'cert_homo.crt' : 'cert.crt';
            $field = $env === 'homo' ? 'afip_homo_cert_path' : 'afip_cert_path';
        } else {
            $filename = 'private.key';
            $field = 'afip_key_path';
        }

        $path = $request->file('file')->storeAs($dir, $filename, 'local');
        $company = Company::findOrFail($companyId);
        $company->update([$field => Storage::disk('local')->path($path)]);

        return response()->json([
            'success' => true,
            'message' => $type === 'cert'
                ? 'Certificado '.strtoupper($env).' cargado.'
                : 'Clave privada cargada.',
        ]);
    }

    /**
     * Valida los archivos cert/key y consulta el último comprobante autorizado
     * por cada tipo de comprobante habilitado para la empresa.
     */
    public function testConnection(Request $request): \Illuminate\Http\JsonResponse
    {
        $companyId = CompanyContext::id();
        $company = Company::findOrFail($companyId);

        // El entorno a probar puede sobreescribirse con ?env=homo|prod
        $environment = $request->query('env', $company->afip_environment ?? 'homo');

        $checks = [];

        $certPath = $company->afipCertPath($environment);
        $certOk = ! empty($certPath) && file_exists($certPath);
        $keyOk = ! empty($company->afip_key_path) && file_exists($company->afip_key_path);

        if (! $certOk) {
            $label = $environment === 'homo' ? 'Homologación' : 'Producción';

            return response()->json(['success' => false, 'error' => "Certificado {$label} no encontrado. Subilo primero en esta sección."]);
        }
        if (! $keyOk) {
            return response()->json(['success' => false, 'error' => 'Clave privada no encontrada. Subila primero en esta sección.']);
        }
        if (empty($company->cuit)) {
            return response()->json(['success' => false, 'error' => 'CUIT de la empresa no configurado. Completalo en la sección Impositiva.']);
        }
        if (empty($company->afip_point_sale)) {
            return response()->json(['success' => false, 'error' => 'Punto de venta no configurado.']);
        }

        // Verificar formato cert (suprimimos warnings: Laravel los convierte en ErrorException)
        $certContent = file_get_contents($certPath);
        $certResource = @openssl_x509_read($certContent);
        if (! $certResource) {
            // Intentar conversión DER → PEM
            $pem = '-----BEGIN CERTIFICATE-----'."\n"
                .chunk_split(base64_encode($certContent), 64, "\n")
                .'-----END CERTIFICATE-----'."\n";
            $certResource = @openssl_x509_read($pem);
            if (! $certResource) {
                return response()->json(['success' => false, 'error' => 'El archivo de certificado no es válido. Debe ser el .crt que ARCA emitió para tu CUIT (no un certificado de la cadena CA).']);
            }
        }

        // Validar que el cert no sea el de la cadena CA
        $certInfo = openssl_x509_parse($certResource);
        $certCN = $certInfo['subject']['CN'] ?? '';
        if (in_array($certCN, ['AC Raiz Test', 'Computadores Test', 'AFIP Root CA 2', 'Computadores'])) {
            return response()->json(['success' => false, 'error' => "El archivo de certificado es un CA de ARCA ({$certCN}), no el certificado de tu empresa. Subí el .crt que obtuviste al registrar tu CSR en el portal de ARCA."]);
        }

        // Verificar formato clave privada
        $keyContent = file_get_contents($company->afip_key_path);
        $keyResource = @openssl_pkey_get_private($keyContent);
        if (! $keyResource) {
            // Detectar si subieron un certificado en vez de la clave
            preg_match('/-----BEGIN ([A-Z ]+)-----/', $keyContent, $m);
            $tipo = $m[1] ?? 'desconocido';
            $hint = str_contains($tipo, 'CERTIFICATE')
                ? " El archivo tiene encabezado '{$tipo}', es un certificado, no una clave privada."
                : '';

            return response()->json(['success' => false, 'error' => 'La clave privada no es válida.'.$hint.' Subí el archivo .key o .pem generado localmente al crear el CSR.']);
        }

        try {
            $wsaa = new \App\Services\Afip\WsaaService($environment);
            $wsfev = new \App\Services\Afip\WsfevService($environment);

            $cuit = preg_replace('/\D/', '', $company->cuit);
            $pointSale = (int) $company->afip_point_sale;

            // Autenticar con WSAA usando el cert del entorno solicitado
            $auth = $wsaa->getAuth($cuit, $certPath, $company->afip_key_path);
            $checks[] = ['label' => 'Autenticación WSAA', 'ok' => true, 'detail' => 'Token obtenido correctamente'];

            // Consultar último comprobante por tipo
            $tiposQuery = $company->iva_condition === 'responsable_inscripto'
                ? ['FA' => 1, 'FB' => 6]
                : ['FC' => 11];

            foreach ($tiposQuery as $key => $code) {
                $last = $wsfev->getLastNumber($auth, $cuit, $pointSale, $code);
                $checks[] = [
                    'label' => "Último comprobante {$key} (PV {$pointSale})",
                    'ok' => true,
                    'detail' => $last === 0 ? 'Sin comprobantes emitidos aún' : "Nº {$last}",
                ];
            }

            return response()->json([
                'success' => true,
                'environment' => $environment,
                'checks' => $checks,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'checks' => $checks,
            ], 422);
        }
    }

    /**
     * Genera un par clave privada RSA + CSR para registrar en el portal ARCA/AFIP.
     * La clave privada se guarda en storage local; el CSR se devuelve al frontend para descargar.
     */
    public function generateCsr(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'alias' => ['required', 'string', 'max:40', 'regex:/^[a-zA-Z0-9_-]+$/'],
        ]);

        $companyId = CompanyContext::id();
        $company = Company::findOrFail($companyId);

        if (empty($company->cuit)) {
            return response()->json(['success' => false, 'error' => 'El CUIT de la empresa no está configurado. Completalo en la sección Datos Fiscales.'], 422);
        }

        $alias = $request->alias;
        $cuit = preg_replace('/\D/', '', $company->cuit);

        $privateKey = @openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        if (! $privateKey) {
            return response()->json(['success' => false, 'error' => 'No se pudo generar la clave privada. Verificá que la extensión openssl esté habilitada en PHP.'], 422);
        }

        $dn = [
            'countryName' => 'AR',
            'organizationName' => $company->name,
            'commonName' => $alias,
            'serialNumber' => "CUIT {$cuit}",
        ];

        $csr = @openssl_csr_new($dn, $privateKey, ['digest_alg' => 'sha256']);

        if (! $csr) {
            return response()->json(['success' => false, 'error' => 'No se pudo generar el CSR.'], 422);
        }

        $keyPem = '';
        @openssl_pkey_export($privateKey, $keyPem);

        $csrPem = '';
        @openssl_csr_export($csr, $csrPem);

        if (empty($keyPem) || empty($csrPem)) {
            return response()->json(['success' => false, 'error' => 'Error al exportar la clave o el CSR.'], 422);
        }

        $storagePath = "afip_certs/{$companyId}/private.key";
        Storage::disk('local')->put($storagePath, $keyPem);
        $company->update(['afip_key_path' => Storage::disk('local')->path($storagePath)]);

        return response()->json([
            'success' => true,
            'csr' => $csrPem,
            'alias' => $alias,
            'message' => 'Clave privada guardada. Descargá el CSR y subilo al portal ARCA.',
        ]);
    }

    /**
     * Actualiza configuración AFIP de la empresa (entorno, auto-factura, punto de venta).
     */
    public function saveSettings(Request $request)
    {
        $validated = $request->validate([
            'afip_environment' => 'required|in:homo,prod',
            'afip_auto_invoice' => 'required|boolean',
            'afip_point_sale' => 'required|integer|min:1|max:99999',
        ]);

        $companyId = CompanyContext::id();
        Company::findOrFail($companyId)->update($validated);

        return response()->json(['success' => true, 'message' => 'Configuración AFIP guardada.']);
    }
}
