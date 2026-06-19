<?php

namespace App\Services\Afip;

use Illuminate\Support\Facades\Log;
use RuntimeException;
use SoapClient;
use SoapFault;

/**
 * WSFEv1 — Web Service de Facturación Electrónica versión 1.
 *
 * Cubre: Facturas A/B/C y Notas de Crédito/Débito para mercado interno.
 * Especificación: wsfev1-RG-4291.
 */
class WsfevService
{
    private SoapClient $client;

    public function __construct(
        private readonly string $environment = 'homo'
    ) {
        $this->client = $this->buildClient();
    }

    /**
     * Obtiene el último número autorizado para un punto de venta y tipo de comprobante.
     */
    public function getLastNumber(array $auth, string $cuit, int $pointSale, int $cbteTipo): int
    {
        $response = $this->call('FECompUltimoAutorizado', [
            'Auth' => $this->buildAuth($auth, $cuit),
            'PtoVta' => $pointSale,
            'CbteTipo' => $cbteTipo,
        ]);

        $result = $response->FECompUltimoAutorizadoResult;
        $this->checkErrors($result->Errors ?? null);

        return (int) ($result->CbteNro ?? 0);
    }

    /**
     * Solicita un CAE para una factura/nota.
     *
     * @param  array<string, mixed>  $invoiceData
     * @return array{cae: string, cae_expiry: string, number: int, observations: string}
     */
    public function requestCae(array $auth, string $cuit, array $invoiceData): array
    {
        $response = $this->call('FECAESolicitar', [
            'Auth' => $this->buildAuth($auth, $cuit),
            'FeCAEReq' => [
                'FeCabReq' => [
                    'CantReg' => 1,
                    'PtoVta' => $invoiceData['point_sale'],
                    'CbteTipo' => $invoiceData['cbte_tipo'],
                ],
                'FeDetReq' => [
                    'FECAEDetRequest' => $this->buildDetail($invoiceData),
                ],
            ],
        ]);

        $result = $response->FECAESolicitarResult;
        $this->checkErrors($result->Errors ?? null);

        $detail = $result->FeDetResp->FECAEDetResponse;

        if ($detail->Resultado !== 'A') {
            $obs = $this->collectObservations($detail->Observaciones ?? null);
            throw new RuntimeException("AFIP rechazó el comprobante. Observaciones: {$obs}");
        }

        return [
            'cae' => (string) $detail->CAE,
            'cae_expiry' => $this->parseDate((string) $detail->CAEFchVto),
            'number' => (int) $detail->CbteDesde,
            'observations' => $this->collectObservations($detail->Observaciones ?? null),
        ];
    }

    /**
     * Consulta un comprobante ya emitido.
     */
    public function queryInvoice(array $auth, string $cuit, int $pointSale, int $cbteTipo, int $cbteNro): array
    {
        $response = $this->call('FECompConsultar', [
            'Auth' => $this->buildAuth($auth, $cuit),
            'FeCompConsReq' => [
                'CbteTipo' => $cbteTipo,
                'CbteNro' => $cbteNro,
                'PtoVta' => $pointSale,
            ],
        ]);

        $result = $response->FECompConsultarResult;
        $this->checkErrors($result->Errors ?? null);

        $detail = $result->ResultGet;

        return [
            'cae' => (string) ($detail->CodAutorizacion ?? ''),
            'cae_expiry' => $this->parseDate((string) ($detail->FchVto ?? '')),
            'resultado' => (string) ($detail->Resultado ?? ''),
        ];
    }

    // ─── Builders ─────────────────────────────────────────────────────────────

    private function buildAuth(array $auth, string $cuit): array
    {
        return [
            'Token' => $auth['token'],
            'Sign' => $auth['sign'],
            'Cuit' => $cuit,
        ];
    }

    /**
     * Construye el detalle del comprobante (FECAEDetRequest).
     *
     * @param  array<string, mixed>  $data
     */
    private function buildDetail(array $data): array
    {
        $detail = [
            'Concepto' => $data['concepto'] ?? 1,  // 1=Productos, 2=Servicios, 3=Ambos
            'DocTipo' => $data['doc_tipo'] ?? 99, // 99=Sin doc / Consumidor Final
            'DocNro' => $data['doc_nro'] ?? 0,
            'CbteDesde' => $data['number'],
            'CbteHasta' => $data['number'],
            'CbteFch' => $data['date'],            // YYYYMMDD
            'ImpTotal' => $this->fmt($data['total']),
            'ImpTotConc' => 0,
            'ImpNeto' => $this->fmt($data['neto']),
            'ImpOpEx' => $this->fmt($data['op_ex'] ?? 0),
            'ImpIVA' => $this->fmt($data['iva_total']),
            'ImpTrib' => 0,
            'MonId' => 'PES',
            'MonCotiz' => 1,
            // RG 5616 — Condición IVA del receptor obligatoria
            // 1=RI, 5=Consumidor Final, 6=Monotributo
            'CondicionIVAReceptorId' => $data['iva_receptor'] ?? 5,
        ];

        // Alícuotas de IVA
        if (! empty($data['iva_items'])) {
            $detail['Iva'] = ['AlicIva' => $data['iva_items']];
        }

        // Comprobantes asociados (para NC/ND) — se usa si se tiene el comprobante original
        if (! empty($data['associated_invoices'])) {
            $detail['CbtesAsoc'] = ['CbteAsoc' => $data['associated_invoices']];
        }

        // Período asociado — alternativa a CbteAsoc cuando no se tiene el comprobante original
        if (! empty($data['period_asoc'])) {
            $detail['PeriodoAsoc'] = [
                'FchDesde' => $data['period_asoc']['fch_desde'],
                'FchHasta' => $data['period_asoc']['fch_hasta'],
            ];
        }

        // Para Factura A: fecha de vto de pago
        if (! empty($data['due_date'])) {
            $detail['FchVtoPago'] = $data['due_date'];
        }

        return $detail;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function call(string $method, array $params): mixed
    {
        try {
            return $this->client->$method($params);
        } catch (SoapFault $e) {
            Log::error("WSFEv1 SOAP fault [{$method}]", [
                'code' => $e->getCode(),
                'message' => $e->getMessage(),
            ]);
            throw new RuntimeException("Error WSFEv1 ({$method}): ".$e->getMessage(), (int) $e->getCode(), $e);
        }
    }

    private function checkErrors(mixed $errors): void
    {
        if (empty($errors)) {
            return;
        }

        $err = is_array($errors->Err ?? null) ? $errors->Err : [$errors->Err];
        $msg = implode(' | ', array_map(
            fn ($e) => "[{$e->Code}] {$e->Msg}",
            $err
        ));

        Log::error('WSFEv1 error AFIP', ['errors' => $msg]);
        throw new RuntimeException("Error AFIP: {$msg}");
    }

    private function collectObservations(mixed $obs): string
    {
        if (empty($obs)) {
            return '';
        }
        $items = is_array($obs->Obs ?? null) ? $obs->Obs : [$obs->Obs ?? $obs];

        return implode(' | ', array_map(
            fn ($o) => "[{$o->Code}] {$o->Msg}",
            array_filter($items)
        ));
    }

    private function parseDate(string $yyyymmdd): string
    {
        if (strlen($yyyymmdd) === 8) {
            return substr($yyyymmdd, 0, 4).'-'.substr($yyyymmdd, 4, 2).'-'.substr($yyyymmdd, 6, 2);
        }

        return $yyyymmdd;
    }

    private function fmt(float $value): float
    {
        return round($value, 2);
    }

    private function buildClient(): SoapClient
    {
        $wsdl = config("afip.wsfev1.{$this->environment}.wsdl");

        // Los servidores AFIP/ARCA usan certificados SSL de autoridades públicas (SSL.com),
        // verificables con el bundle del sistema — no con la CA chain de aplicación de AFIP.
        // Se permiten ciphers con DH keys pequeñas porque los servidores de prod de AFIP
        // usan DH de 512 bits, rechazado por OpenSSL con security level >= 1.
        $systemCa = '/etc/ssl/certs/ca-certificates.crt';
        // open_basedir en hosting compartido puede bloquear file_exists() en /etc/ssl
        $caExists = @file_exists($systemCa);
        $sslOpts = [
            'verify_peer' => $caExists,
            'verify_peer_name' => $caExists,
            'cafile' => $systemCa,
            'ciphers' => 'DEFAULT:@SECLEVEL=0',
        ];

        $options = [
            'soap_version' => \SOAP_1_2,
            'exceptions' => true,
            'trace' => false,
            'encoding' => 'UTF-8',
            'cache_wsdl' => \WSDL_CACHE_NONE,
            'connection_timeout' => 30,
            'stream_context' => stream_context_create(['ssl' => $sslOpts]),
        ];

        try {
            return new SoapClient($wsdl, $options);
        } catch (SoapFault $e) {
            throw new RuntimeException('No se pudo conectar con WSFEv1: '.$e->getMessage(), 0, $e);
        }
    }
}
