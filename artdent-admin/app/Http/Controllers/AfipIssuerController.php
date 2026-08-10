<?php

namespace App\Http\Controllers;

use App\Models\AfipIssuerSetting;
use App\Models\SubscriptionInvoice;
use App\Services\Afip\WsaaService;
use App\Services\Afip\WsfevService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Identidad AFIP con la que ArtCode factura la suscripción SaaS a sus
 * tenants — separada de la identidad AFIP de cada tenant (esa se administra
 * desde el propio artdent-crm, en Configuración → AFIP/ARCA).
 */
class AfipIssuerController extends Controller
{
    public function edit(): Response
    {
        $issuer = AfipIssuerSetting::current();

        return Inertia::render('AfipIssuer/Edit', [
            'issuer' => $issuer,
            'invoices' => SubscriptionInvoice::orderByDesc('id')->limit(50)->get(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'cuit' => ['required', 'string', 'max:20'],
            'iva_condition' => ['required', 'in:responsable_inscripto,monotributista,exento'],
            'point_sale' => ['required', 'integer', 'min:1', 'max:99999'],
            'environment' => ['required', 'in:homo,prod'],
            'auto_invoice' => ['required', 'boolean'],
        ]);

        $issuer = AfipIssuerSetting::current();

        if ($issuer) {
            $issuer->update($validated);
        } else {
            AfipIssuerSetting::create($validated);
        }

        return back()->with('success', 'Configuración AFIP actualizada.');
    }

    public function uploadCert(Request $request)
    {
        $request->validate([
            'type' => 'required|in:cert,key',
            'env' => 'nullable|in:homo,prod',
            'file' => 'required|file|extensions:crt,pem,key,txt|max:64',
        ]);

        $issuer = AfipIssuerSetting::current();

        if (! $issuer) {
            return back()->with('error', 'Guardá primero los datos del emisor.');
        }

        $type = $request->type;
        $env = $request->env ?? 'prod';
        $dir = 'afip_certs/issuer';

        if ($type === 'cert') {
            $filename = $env === 'homo' ? 'cert_homo.crt' : 'cert.crt';
            $field = $env === 'homo' ? 'homo_cert_path' : 'cert_path';
        } else {
            $filename = 'private.key';
            $field = 'key_path';
        }

        $path = $request->file('file')->storeAs($dir, $filename, 'local');
        $issuer->update([$field => Storage::disk('local')->path($path)]);

        return back()->with('success', $type === 'cert' ? 'Certificado '.strtoupper($env).' cargado.' : 'Clave privada cargada.');
    }

    /**
     * Genera un par clave privada RSA + CSR para registrar en el portal ARCA.
     * La clave privada se guarda en storage local; el CSR se devuelve al
     * frontend para descargar. Mismo mecanismo que AfipController::generateCsr()
     * del lado tenant (artdent-crm), acá aplicado a la identidad emisora única.
     */
    public function generateCsr(Request $request)
    {
        $request->validate([
            'alias' => ['required', 'string', 'max:40', 'regex:/^[a-zA-Z0-9_-]+$/'],
        ]);

        $issuer = AfipIssuerSetting::current();

        if (! $issuer || empty($issuer->cuit)) {
            return response()->json(['success' => false, 'error' => 'Guardá primero la razón social y el CUIT del emisor.'], 422);
        }

        $alias = $request->alias;
        $cuit = preg_replace('/\D/', '', $issuer->cuit);

        $privateKey = @openssl_pkey_new([
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA,
        ]);

        if (! $privateKey) {
            return response()->json(['success' => false, 'error' => 'No se pudo generar la clave privada. Verificá que la extensión openssl esté habilitada en PHP.'], 422);
        }

        $dn = [
            'countryName' => 'AR',
            'organizationName' => $issuer->name,
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

        $storagePath = 'afip_certs/issuer/private.key';
        Storage::disk('local')->put($storagePath, $keyPem);
        $issuer->update(['key_path' => Storage::disk('local')->path($storagePath)]);

        return response()->json([
            'success' => true,
            'csr' => $csrPem,
            'alias' => $alias,
            'message' => 'Clave privada guardada. Descargá el CSR y subilo al portal ARCA.',
        ]);
    }

    public function testConnection(Request $request)
    {
        $issuer = AfipIssuerSetting::current();

        if (! $issuer) {
            return response()->json(['success' => false, 'error' => 'No hay configuración AFIP guardada.']);
        }

        $environment = $request->query('env', $issuer->environment);
        $certPath = $issuer->certPath($environment);

        if (empty($certPath) || ! file_exists($certPath)) {
            return response()->json(['success' => false, 'error' => 'Certificado no encontrado para ese entorno.']);
        }

        if (empty($issuer->key_path) || ! file_exists($issuer->key_path)) {
            return response()->json(['success' => false, 'error' => 'Clave privada no encontrada.']);
        }

        try {
            $wsaa = new WsaaService($environment);
            $wsfev = new WsfevService($environment);

            $cuit = preg_replace('/\D/', '', $issuer->cuit);
            $auth = $wsaa->getAuth($cuit, $certPath, $issuer->key_path);

            $cbteTipo = $issuer->iva_condition === 'monotributista' ? 11 : 6;
            $last = $wsfev->getLastNumber($auth, $cuit, $issuer->point_sale, $cbteTipo);

            return response()->json([
                'success' => true,
                'environment' => $environment,
                'checks' => [
                    ['label' => 'Autenticación WSAA', 'ok' => true, 'detail' => 'Token obtenido correctamente'],
                    ['label' => "Último comprobante (PV {$issuer->point_sale})", 'ok' => true, 'detail' => $last === 0 ? 'Sin comprobantes emitidos aún' : "Nº {$last}"],
                ],
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 422);
        }
    }
}
