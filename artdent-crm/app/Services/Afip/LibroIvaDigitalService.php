<?php

namespace App\Services\Afip;

use App\Models\Invoice;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;
use ZipArchive;

/**
 * Servicio para generación de archivos fiscales de Libro de IVA Digital (RG 4597),
 * CITI Ventas (RG 3685) y CSV para sistemas contables (Tango, Holistor, Bejerman, SOS Contador).
 */
class LibroIvaDigitalService
{
    /**
     * Mapeo de códigos de documento según tabla AFIP/ARCA:
     * 80 = CUIT, 86 = CUIL, 96 = DNI, 99 = Sin identificar / Consumidor Final
     */
    public const DOC_CUIT = 80;

    public const DOC_CUIL = 86;

    public const DOC_DNI = 96;

    public const DOC_CF = 99;

    /**
     * Códigos de alícuotas AFIP:
     * 0003 = 0%
     * 0004 = 10.5%
     * 0005 = 21%
     * 0006 = 27%
     * 0008 = 5%
     * 0009 = 2.5%
     */
    public const ALICUOTA_CODES = [
        '0' => '0003',
        '10.5' => '0004',
        '21' => '0005',
        '27' => '0006',
        '5' => '0008',
        '2.5' => '0009',
    ];

    /**
     * Genera el contenido del archivo de Comprobantes de Ventas (266 caracteres por línea).
     */
    public function buildVentasCbte(iterable $invoices): string
    {
        $lines = [];

        foreach ($invoices as $inv) {
            $lines[] = $this->formatCbteLine($inv);
        }

        return implode("\r\n", $lines).(count($lines) > 0 ? "\r\n" : '');
    }

    /**
     * Genera el contenido del archivo de Alícuotas de Ventas (62 caracteres por línea).
     * Omite comprobantes tipo C (Monotributo) que no discriminan IVA.
     */
    public function buildVentasAlicuotas(iterable $invoices): string
    {
        $lines = [];

        foreach ($invoices as $inv) {
            // Comprobantes C (11, 12, 13, 15) no discriminan IVA
            $afipCode = (int) ($inv->invoice_type?->afip_code ?? $inv->invoice_type_id ?? 11);
            if (in_array($afipCode, [11, 12, 13, 15])) {
                continue;
            }

            $alicuotas = $this->resolveAlicuotas($inv);
            foreach ($alicuotas as $ali) {
                $lines[] = $this->formatAlicuotaLine($inv, $ali);
            }
        }

        return implode("\r\n", $lines).(count($lines) > 0 ? "\r\n" : '');
    }

    /**
     * Formatea una línea de comprobante de ventas (exactamente 266 caracteres).
     */
    public function formatCbteLine(Invoice $inv): string
    {
        $date = Carbon::parse($inv->issued_at ?? $inv->created_at)->format('Ymd');
        $afipCode = (int) ($inv->invoice_type?->afip_code ?? $inv->invoice_type_id ?? 11);
        $pointSale = (int) ($inv->point_sale ?? 1);
        $number = (int) ($inv->number ?? 1);

        [$docTipo, $docNro] = $this->resolveDoc($inv);
        $buyerName = $this->sanitizeAscii($inv->recipient_name ?: 'Consumidor Final', 30);

        $total = (float) $inv->total;
        $subtotal = (float) $inv->subtotal;
        $opEx = 0.0;
        $noGravado = 0.0;

        if (isset($inv->afip_request['op_ex'])) {
            $opEx = (float) $inv->afip_request['op_ex'];
        }

        $alicuotas = in_array($afipCode, [11, 12, 13, 15]) ? [] : $this->resolveAlicuotas($inv);
        $cantAlicuotas = count($alicuotas);

        // Código de operación: '0' habitual, 'E' exento, 'N' no gravado
        $codOperacion = '0';
        if ($total > 0 && $opEx >= $total) {
            $codOperacion = 'E';
        }

        $vtoPago = $inv->cae_expiry
            ? Carbon::parse($inv->cae_expiry)->format('Ymd')
            : ($inv->due_date ? Carbon::parse($inv->due_date)->format('Ymd') : $date);

        // Construcción campo por campo
        $f1_fecha = str_pad($date, 8, '0', STR_PAD_LEFT);
        $f2_tipo = str_pad((string) $afipCode, 3, '0', STR_PAD_LEFT);
        $f3_pos = str_pad((string) $pointSale, 5, '0', STR_PAD_LEFT);
        $f4_nroDesde = str_pad((string) $number, 20, '0', STR_PAD_LEFT);
        $f5_nroHasta = str_pad((string) $number, 20, '0', STR_PAD_LEFT);
        $f6_docTipo = str_pad((string) $docTipo, 2, '0', STR_PAD_LEFT);
        $f7_docNro = str_pad((string) $docNro, 20, '0', STR_PAD_LEFT);
        $f8_nombre = str_pad($buyerName, 30, ' ', STR_PAD_RIGHT);
        $f9_total = $this->formatAmount($total);
        $f10_noGrav = $this->formatAmount($noGravado);
        $f11_percNoCat = $this->formatAmount(0.0);
        $f12_exento = $this->formatAmount($opEx);
        $f13_percNac = $this->formatAmount(0.0);
        $f14_percIibb = $this->formatAmount(0.0);
        $f15_percMun = $this->formatAmount(0.0);
        $f16_impInt = $this->formatAmount(0.0);
        $f17_moneda = 'PES';
        $f18_cotiz = '0001000000'; // 1.000000
        $f19_cantAli = str_pad((string) min($cantAlicuotas, 9), 1, '0', STR_PAD_LEFT);
        $f20_codOp = substr($codOperacion, 0, 1);
        $f21_otrosTrib = $this->formatAmount(0.0);
        $f22_vto = str_pad($vtoPago, 8, '0', STR_PAD_LEFT);

        $line = $f1_fecha
            .$f2_tipo
            .$f3_pos
            .$f4_nroDesde
            .$f5_nroHasta
            .$f6_docTipo
            .$f7_docNro
            .$f8_nombre
            .$f9_total
            .$f10_noGrav
            .$f11_percNoCat
            .$f12_exento
            .$f13_percNac
            .$f14_percIibb
            .$f15_percMun
            .$f16_impInt
            .$f17_moneda
            .$f18_cotiz
            .$f19_cantAli
            .$f20_codOp
            .$f21_otrosTrib
            .$f22_vto;

        // Longitud estricta de 266 caracteres
        return substr($line, 0, 266);
    }

    /**
     * Formatea una línea de alícuotas de comprobante de ventas (exactamente 62 caracteres).
     */
    public function formatAlicuotaLine(Invoice $inv, array $ali): string
    {
        $afipCode = (int) ($inv->invoice_type?->afip_code ?? $inv->invoice_type_id ?? 11);
        $pointSale = (int) ($inv->point_sale ?? 1);
        $number = (int) ($inv->number ?? 1);

        $f1_tipo = str_pad((string) $afipCode, 3, '0', STR_PAD_LEFT);
        $f2_pos = str_pad((string) $pointSale, 5, '0', STR_PAD_LEFT);
        $f3_nro = str_pad((string) $number, 20, '0', STR_PAD_LEFT);
        $f4_neto = $this->formatAmount((float) ($ali['BaseImp'] ?? 0));
        $f5_aliCode = str_pad((string) ($ali['Id'] ?? '0005'), 4, '0', STR_PAD_LEFT);
        $f6_iva = $this->formatAmount((float) ($ali['Importe'] ?? 0));

        $line = $f1_tipo
            .$f2_pos
            .$f3_nro
            .$f4_neto
            .$f5_aliCode
            .$f6_iva;

        // Longitud estricta de 62 caracteres
        return substr($line, 0, 62);
    }

    /**
     * Construye las filas de exportación CSV contable estructurado.
     */
    public function buildAccountantCsvRows(iterable $invoices): array
    {
        $rows = [];

        foreach ($invoices as $inv) {
            $issuedAt = $inv->issued_at ?? $inv->created_at;
            $fecha = $issuedAt ? Carbon::parse($issuedAt)->format('d/m/Y') : '';
            $pos = str_pad((string) ($inv->point_sale ?? 1), 5, '0', STR_PAD_LEFT);
            $nro = str_pad((string) ($inv->number ?? 1), 8, '0', STR_PAD_LEFT);
            $tipoComp = $inv->invoice_type?->name ?? 'Factura';
            $cae = $inv->cae ?? '';
            $vtoCae = $inv->cae_expiry ? Carbon::parse($inv->cae_expiry)->format('d/m/Y') : '';

            [$docTipo, $docNro] = $this->resolveDoc($inv);
            $docTipoLabel = match ($docTipo) {
                self::DOC_CUIT => 'CUIT',
                self::DOC_DNI => 'DNI',
                self::DOC_CUIL => 'CUIL',
                default => 'CF',
            };

            $cliente = $inv->recipient_name ?: 'Consumidor Final';
            $condIva = $inv->recipient_iva ?: 'consumidor_final';

            // Desglose de importes
            $alicuotas = $this->resolveAlicuotas($inv);
            $afipCode = (int) ($inv->invoice_type?->afip_code ?? $inv->invoice_type_id ?? 11);
            $isMonotributo = in_array($afipCode, [11, 12, 13, 15]);

            $netoGravado = 0.0;
            $iva21 = 0.0;
            $iva105 = 0.0;
            $iva27 = 0.0;
            $exento = (float) ($inv->afip_request['op_ex'] ?? 0);
            $noGravado = 0.0;

            if ($isMonotributo) {
                // En Factura C todo el subtotal es neto (sin IVA discriminado)
                $netoGravado = (float) $inv->total;
            } else {
                foreach ($alicuotas as $ali) {
                    $base = (float) ($ali['BaseImp'] ?? 0);
                    $imp = (float) ($ali['Importe'] ?? 0);
                    $netoGravado += $base;

                    $id = str_pad((string) ($ali['Id'] ?? ''), 4, '0', STR_PAD_LEFT);
                    if ($id === '0005') {
                        $iva21 += $imp;
                    } elseif ($id === '0004') {
                        $iva105 += $imp;
                    } elseif ($id === '0006') {
                        $iva27 += $imp;
                    }
                }
            }

            $rows[] = [
                $fecha,
                $pos,
                $nro,
                $tipoComp,
                $cae,
                $vtoCae,
                $docTipoLabel,
                (string) $docNro,
                $cliente,
                $condIva,
                number_format($netoGravado, 2, ',', '.'),
                number_format($noGravado, 2, ',', '.'),
                number_format($exento, 2, ',', '.'),
                number_format($iva21, 2, ',', '.'),
                number_format($iva105, 2, ',', '.'),
                number_format($iva27, 2, ',', '.'),
                '0,00', // Percepciones IIBB
                number_format((float) $inv->total, 2, ',', '.'),
            ];
        }

        return $rows;
    }

    /**
     * Genera y descarga un archivo ZIP con los dos TXT en streaming.
     *
     * @param  string  $format  'rg4597' (Portal IVA) o 'rg3685' (CITI Ventas / SIAP)
     */
    public function downloadZip(iterable $invoices, string $from, string $to, string $format = 'rg4597'): StreamedResponse
    {
        $cbteTxt = $this->buildVentasCbte($invoices);
        $alicuotasTxt = $this->buildVentasAlicuotas($invoices);

        if ($format === 'rg3685') {
            $cbteFileName = 'REGINFO_CV_VENTAS_CBTE.txt';
            $aliFileName = 'REGINFO_CV_VENTAS_ALICUOTAS.txt';
            $zipName = "citi_ventas_rg3685_{$from}_{$to}.zip";
        } else {
            $cbteFileName = 'LIBRO_IVA_DIGITAL_VENTAS_CBTE.txt';
            $aliFileName = 'LIBRO_IVA_DIGITAL_VENTAS_ALICUOTAS.txt';
            $zipName = "libro_iva_digital_rg4597_{$from}_{$to}.zip";
        }

        return response()->streamDownload(function () use ($cbteFileName, $aliFileName, $cbteTxt, $alicuotasTxt) {
            $tmpFile = tempnam(sys_get_temp_dir(), 'iva_zip_');
            $zip = new ZipArchive;
            if ($zip->open($tmpFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) === true) {
                $zip->addFromString($cbteFileName, $cbteTxt);
                $zip->addFromString($aliFileName, $alicuotasTxt);
                $zip->close();
            }

            readfile($tmpFile);
            @unlink($tmpFile);
        }, $zipName, [
            'Content-Type' => 'application/zip',
        ]);
    }

    // ─── Helpers Privados ─────────────────────────────────────────────────────

    /**
     * Resuelve el desglose de alícuotas del comprobante.
     * Prioriza $inv->afip_request['iva_items'], con fallback a invoice_items.
     */
    private function resolveAlicuotas(Invoice $inv): array
    {
        if (! empty($inv->afip_request['iva_items']) && is_array($inv->afip_request['iva_items'])) {
            $items = [];
            foreach ($inv->afip_request['iva_items'] as $it) {
                $items[] = [
                    'Id' => str_pad((string) ($it['Id'] ?? 5), 4, '0', STR_PAD_LEFT),
                    'BaseImp' => round((float) ($it['BaseImp'] ?? 0), 2),
                    'Importe' => round((float) ($it['Importe'] ?? 0), 2),
                ];
            }

            return $items;
        }

        // Fallback calculando desde invoice_items si afip_request no tiene desglose
        $ivaMap = [];
        $items = $inv->invoice_items;

        if ($items && $items->count() > 0) {
            foreach ($items as $item) {
                $rate = (float) ($item->tax_rate ?? 0);
                if ($rate > 0 && $rate < 1) {
                    $rate = round($rate * 100, 2);
                }

                if ($rate > 0) {
                    $rateKey = (string) $rate;
                    $code = self::ALICUOTA_CODES[$rateKey] ?? '0005';
                    $itemTotal = (float) $item->total;
                    $itemNeto = round($itemTotal / (1 + $rate / 100), 2);
                    $itemIva = round($itemTotal - $itemNeto, 2);

                    $ivaMap[$code] ??= ['Id' => $code, 'BaseImp' => 0.0, 'Importe' => 0.0];
                    $ivaMap[$code]['BaseImp'] += $itemNeto;
                    $ivaMap[$code]['Importe'] += $itemIva;
                }
            }
        }

        // Si no se pudo determinar pero el comprobante tiene tax_amount > 0, usar 21% por defecto
        if (empty($ivaMap) && (float) $inv->tax_amount > 0) {
            $ivaMap['0005'] = [
                'Id' => '0005',
                'BaseImp' => round((float) $inv->subtotal, 2),
                'Importe' => round((float) $inv->tax_amount, 2),
            ];
        }

        return array_values($ivaMap);
    }

    /**
     * Resuelve el código de documento (80, 96, 99) y el número numérico limpio.
     */
    private function resolveDoc(Invoice $inv): array
    {
        if (isset($inv->afip_request['doc_tipo']) && isset($inv->afip_request['doc_nro'])) {
            return [(int) $inv->afip_request['doc_tipo'], preg_replace('/\D/', '', (string) $inv->afip_request['doc_nro']) ?: '0'];
        }

        $rawDoc = preg_replace('/\D/', '', (string) ($inv->recipient_cuit ?? ''));
        if (strlen($rawDoc) === 11) {
            return [self::DOC_CUIT, $rawDoc];
        }

        if (strlen($rawDoc) >= 7 && strlen($rawDoc) <= 8) {
            return [self::DOC_DNI, $rawDoc];
        }

        return [self::DOC_CF, '0'];
    }

    /**
     * Formatea un importe a 15 dígitos (13 enteros + 2 decimales sin punto ni coma).
     */
    private function formatAmount(float $amount): string
    {
        $cents = (int) round(abs($amount) * 100);

        return str_pad((string) $cents, 15, '0', STR_PAD_LEFT);
    }

    /**
     * Convierte una cadena a ASCII estándar (sin tildes/eñes) y la recorta a la longitud dada.
     */
    private function sanitizeAscii(string $str, int $length): string
    {
        $unaccented = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $str) ?: $str;
        $clean = preg_replace('/[^A-Za-z0-9 .,\-\/]/', ' ', $unaccented);

        return substr($clean, 0, $length);
    }
}
