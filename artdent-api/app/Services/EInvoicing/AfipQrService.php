<?php
namespace App\Services\EInvoicing;

class AfipQrService
{
    public static function buildUrl(array $data, ?string $base=null): string
    {
        $payload = [
            'ver'=>1,
            'fecha'=> $data['fecha'],
            'cuit'=> (int) $data['cuit'],
            'ptoVta'=> (int) $data['pto_vta'],
            'tipoCmp'=> (int) $data['tipo_cmp'],
            'nroCmp'=> (int) $data['nro_cmp'],
            'importe'=> (float) $data['importe'],
            'moneda'=> 'PES',
            'ctz'=> 1,
            'tipoDocRec'=> (int) ($data['tipo_doc_rec'] ?? 99),
            'nroDocRec'=> (int) ($data['nro_doc_rec'] ?? 0),
            'tipoCodAut'=> 'E',
            'codAut'=> (string) $data['cae'],
        ];
        $b64 = base64_encode(json_encode($payload, JSON_UNESCAPED_SLASHES));
        $base = $base ?: config('afip.qr_base');
        return $base . $b64;
    }
}
