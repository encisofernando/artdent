<?php

namespace App\Services\Afip;

use App\Models\AfipPointOfSale;
use App\Models\Company;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoiceType;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Servicio principal de integración AFIP/ARCA.
 *
 * Orquesta WSAA + WSFEv1 para emitir comprobantes electrónicos.
 * Soporta: Facturas A/B/C · Notas de Crédito A/B/C · Notas de Débito A/B/C.
 */
class AfipService
{
    // Mapa receipt_key → código AFIP
    private const CBTE_TIPO = [
        'FA' => 1,   // Factura A
        'NCA' => 2,   // Nota de Crédito A
        'NDA' => 3,   // Nota de Débito A
        'FB' => 6,   // Factura B
        'NCB' => 7,   // Nota de Crédito B
        'NDB' => 8,   // Nota de Débito B
        'FC' => 11,  // Factura C
        'NCC' => 12,  // Nota de Crédito C
        'NDC' => 13,  // Nota de Débito C
    ];

    // Alícuota IVA % (string) → código AFIP
    private const IVA_CODES = [
        '0' => 3,
        '10.5' => 4,
        '21' => 5,
        '27' => 6,
        '5' => 8,
        '2.5' => 9,
    ];

    private WsaaService $wsaa;

    private WsfevService $wsfev;

    private string $environment;

    public function __construct(Company $company)
    {
        $this->environment = $company->afip_environment ?? 'homo';
        $this->wsaa = new WsaaService($this->environment);
        $this->wsfev = new WsfevService($this->environment);
    }

    /**
     * Genera un comprobante AFIP a partir de una venta.
     * Crea el registro Invoice en la DB y solicita el CAE.
     *
     * @param  Sale  $sale  Venta origen (con company, sale_items, customer cargados)
     * @param  string  $receiptKey  Ej: 'FA', 'FB', 'FC', 'NCA', 'NCB' …
     * @return Invoice Invoice con CAE y número AFIP asignados
     */
    public function generateFromSale(Sale $sale, string $receiptKey): Invoice
    {
        $company = $sale->company;
        $this->assertCompanyReady($company);

        $cbteTipo = self::CBTE_TIPO[$receiptKey]
            ?? throw new RuntimeException("Tipo de comprobante inválido: {$receiptKey}");

        $pointSale = $this->resolvePointSale($company, $sale->branch_id);
        $cuit = preg_replace('/\D/', '', $company->cuit);

        // 1 — Obtener token WSAA
        $auth = $this->wsaa->getAuth(
            $cuit,
            $company->afipCertPath($this->environment),
            $company->afip_key_path
        );

        // 2 — Próximo número de comprobante
        $lastNumber = $this->wsfev->getLastNumber($auth, $cuit, $pointSale, $cbteTipo);
        $nextNumber = $lastNumber + 1;

        // 3 — Calcular importes
        $items = $sale->sale_items;
        $neto = 0.0;
        $opEx = 0.0;
        $ivaTotal = 0.0;
        $ivaItems = [];

        // FA/NCA/NDA/FB/NCB/NDB son comprobantes de Responsable Inscripto.
        // Para RI: items sin IVA son "exentos" → ImpOpEx (no ImpNeto).
        // Para FC/NCC/NDC (monotributista): todo va a ImpNeto, sin sección IVA.
        $isRI = in_array($cbteTipo, [1, 2, 3, 6, 7, 8]);

        foreach ($items as $item) {
            $taxRate = (float) ($item->tax_rate ?? 0);

            // El frontend guarda tax_rate como decimal (0.21); IVA_CODES usa porcentaje (21).
            // Normalizar: si el valor es fraccionario (< 1) convertir a porcentaje.
            if ($taxRate > 0 && $taxRate < 1) {
                $taxRate = round($taxRate * 100, 2);
            }

            if ($taxRate > 0) {
                $itemNeto = round($item->total / (1 + $taxRate / 100), 2);
                $itemIva = round($item->total - $itemNeto, 2);
                $neto += $itemNeto;
                $ivaTotal += $itemIva;
                $code = self::IVA_CODES[(string) $taxRate] ?? 5;
                $ivaItems[$code] ??= ['Id' => $code, 'BaseImp' => 0, 'Importe' => 0];
                $ivaItems[$code]['BaseImp'] += $itemNeto;
                $ivaItems[$code]['Importe'] += $itemIva;
            } elseif ($isRI) {
                $opEx += (float) $item->total;
            } else {
                $neto += (float) $item->total;
            }
        }

        // Redondear acumulados
        foreach ($ivaItems as &$iva) {
            $iva['BaseImp'] = round($iva['BaseImp'], 2);
            $iva['Importe'] = round($iva['Importe'], 2);
        }
        unset($iva);

        // Datos del receptor
        [$docTipo, $docNro, $ivaReceptor] = $this->resolveRecipient($sale, $receiptKey);

        $saleDate = Carbon::parse($sale->sold_at ?? $sale->created_at);
        $date = $saleDate->format('Ymd');

        $invoiceData = [
            'point_sale' => $pointSale,
            'cbte_tipo' => $cbteTipo,
            'number' => $nextNumber,
            'date' => $date,
            'total' => round((float) $sale->total, 2),
            'neto' => round($neto, 2),
            'op_ex' => round($opEx, 2),
            'iva_total' => round($ivaTotal, 2),
            'iva_items' => array_values($ivaItems),
            'doc_tipo' => $docTipo,
            'doc_nro' => $docNro,
            'iva_receptor' => $ivaReceptor, // RG 5616: CondicionIVAReceptorId
            'concepto' => 1, // Productos
        ];

        // NC/ND requieren CbteAsoc o PeriodoAsoc obligatorio (error AFIP 10197).
        // Usamos PeriodoAsoc con el mes de la venta para no depender del comprobante original.
        $isDebitCredit = in_array($receiptKey, ['NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC']);
        if ($isDebitCredit) {
            // FchHasta no puede ser posterior a la fecha de emisión (error AFIP 10208)
            $invoiceData['period_asoc'] = [
                'fch_desde' => $saleDate->copy()->startOfMonth()->format('Ymd'),
                'fch_hasta' => $saleDate->format('Ymd'),
            ];
        }

        // 4 — Solicitar CAE
        DB::beginTransaction();
        try {
            $invoice = $this->createInvoiceRecord($sale, $receiptKey, $invoiceData);

            $caeDat = $this->wsfev->requestCae($auth, $cuit, $invoiceData);

            $invoice->update([
                'number' => $caeDat['number'],
                'cae' => $caeDat['cae'],
                'cae_expiry' => $caeDat['cae_expiry'],
                'status' => 'authorized',
                'afip_observations' => $caeDat['observations'] ?: null,
                'afip_response' => $caeDat,
            ]);

            // Vincular factura a la venta
            $sale->update(['invoice_id' => $invoice->id]);

            DB::commit();

            Log::info('Factura AFIP emitida OK', [
                'invoice_id' => $invoice->id,
                'cae' => $caeDat['cae'],
                'sale_id' => $sale->id,
            ]);

            return $invoice->fresh();

        } catch (\Throwable $e) {
            DB::rollBack();

            // Guardar el error en el invoice si ya fue creado
            if (isset($invoice)) {
                $invoice->update([
                    'status' => 'failed',
                    'afip_error_msg' => $e->getMessage(),
                ]);
            }

            Log::error('Error al emitir factura AFIP', [
                'sale_id' => $sale->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    /**
     * Determina si la empresa puede emitir un tipo de comprobante según su condición IVA.
     *
     * Monotributista → solo C (código 11, 12, 13)
     * RI             → A y B (1-3, 6-8)
     */
    public static function allowedReceiptKeys(string $ivaCondition): array
    {
        return match ($ivaCondition) {
            'responsable_inscripto' => ['FA', 'NCA', 'NDA', 'FB', 'NCB', 'NDB'],
            'monotributista' => ['FC', 'NCC', 'NDC'],
            default => ['FC', 'NCC', 'NDC'],
        };
    }

    /**
     * Retorna el tipo de comprobante más adecuado para una venta según la empresa y el cliente.
     * RI → A si el cliente tiene CUIT, B en caso contrario.
     * Monotributista → C siempre.
     */
    public static function suggestReceiptKey(Company $company, ?string $customerCuit = null): string
    {
        if ($company->iva_condition === 'responsable_inscripto') {
            return $customerCuit ? 'FA' : 'FB';
        }

        return 'FC';
    }

    // ─── Helpers privados ─────────────────────────────────────────────────────

    private function createInvoiceRecord(Sale $sale, string $receiptKey, array $data): Invoice
    {
        $invoiceType = InvoiceType::where('afip_code', self::CBTE_TIPO[$receiptKey])->first()
            ?? InvoiceType::firstOrCreate(
                ['afip_code' => self::CBTE_TIPO[$receiptKey]],
                ['name' => $receiptKey, 'is_active' => true]
            );

        $invoice = Invoice::create([
            'company_id' => $sale->company_id,
            'invoice_type_id' => $invoiceType->id,
            'user_id' => $sale->user_id,
            'reference_type' => Sale::class,
            'reference_id' => $sale->id,
            'recipient_name' => $sale->customer?->name ?? 'Consumidor Final',
            'recipient_cuit' => $sale->customer?->cuit ?? $sale->customer?->dni ?? null,
            'recipient_iva' => 'consumidor_final',
            'recipient_address' => $sale->customer?->address ?? null,
            'point_sale' => $data['point_sale'],
            'number' => $data['number'],  // provisional, se actualiza con CAE
            'subtotal' => $data['neto'],
            'discount' => (float) ($sale->discount_amount ?? 0),
            'tax_amount' => $data['iva_total'],
            'total' => $data['total'],
            'status' => 'pending',
            'issued_at' => $sale->sold_at ?? $sale->created_at,
            'environment' => $this->environment,
            'afip_request' => $data,
        ]);

        // Crear ítems del invoice
        foreach ($sale->sale_items as $item) {
            InvoiceItem::create([
                'invoice_id' => $invoice->id,
                'description' => $item->product_name,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'discount' => $item->discount ?? 0,
                'tax_rate' => $item->tax_rate ?? 0,
                'total' => $item->total,
            ]);
        }

        return $invoice;
    }

    /**
     * Determina DocTipo, DocNro y CondicionIVAReceptorId del receptor.
     *
     * Reglas según normativa AFIP/ARCA vigente:
     *   — RI / Monotributo / Exento → DocTipo 80 (CUIT), 11 dígitos obligatorio.
     *   — Consumidor Final con total >= CF_LIMIT → DNI obligatorio (DocTipo 96).
     *   — Consumidor Final con DNI → DocTipo 96.
     *   — Consumidor Final sin doc → DocTipo 99, DocNro 0 (solo si total < CF_LIMIT).
     *
     * CondicionIVAReceptorId (RG 5616):
     *   1 = Responsable Inscripto · 4 = Exento · 5 = Consumidor Final · 6 = Monotributo
     *
     * @return array{int, int, int} [docTipo, docNro, condicionIVAReceptorId]
     */
    private function resolveRecipient(Sale $sale, string $receiptKey): array
    {
        // Monto límite para CF sin identificar (RG 4290-E art. 5 inc. b)
        $cfLimit = (float) config('afip.cf_identification_limit', 10_000_000);

        $customer = $sale->customer;
        $total = round((float) $sale->total, 2);
        $ivaCondition = $customer?->iva_condition ?? 'consumidor_final';

        // ── Comprobantes tipo A → receptor debe ser RI (CUIT obligatorio) ─────
        if (in_array($receiptKey, ['FA', 'NCA', 'NDA'])) {
            return $this->resolveConCuit($customer, $ivaCondition, forceRI: true);
        }

        // ── RI / Monotributo / Exento → siempre con CUIT ────────────────────
        if (in_array($ivaCondition, ['responsable_inscripto', 'monotributista', 'exento'])) {
            return $this->resolveConCuit($customer, $ivaCondition, forceRI: false);
        }

        // ── Consumidor Final ─────────────────────────────────────────────────
        $dni = $customer?->dni ? preg_replace('/\D/', '', $customer->dni) : null;

        // Si supera el límite, identificación obligatoria
        if ($total >= $cfLimit) {
            if (empty($dni)) {
                $limitFmt = number_format($cfLimit, 0, ',', '.');
                throw new RuntimeException(
                    "Para operaciones iguales o mayores a \${$limitFmt} el receptor debe estar identificado con DNI. ".
                    'Registre el DNI del cliente antes de facturar.'
                );
            }
        }

        if (! empty($dni)) {
            // CUIL/CUIT (11 dígitos) en campo dni → extraer los 8 dígitos centrales como DNI
            // Formato CUIL: XX-XXXXXXXX-X (prefijo 2 + dni 8 + verificador 1)
            if (ctype_digit($dni) && strlen($dni) === 11) {
                $dni = substr($dni, 2, 8);
            }

            if (! ctype_digit($dni) || strlen($dni) < 7 || strlen($dni) > 8) {
                throw new RuntimeException(
                    "DNI inválido: debe ser numérico de 7 u 8 dígitos (recibido: '{$dni}')."
                );
            }

            return [96, (int) $dni, 5];
        }

        // Sin documento — DocTipo 99, DocNro siempre 0
        return [99, 0, 5];
    }

    /**
     * Resuelve receptor con CUIT (RI, Monotributo, Exento o Factura A).
     *
     * @return array{int, int, int}
     */
    private function resolveConCuit(?object $customer, string $ivaCondition, bool $forceRI): array
    {
        $cuit = $customer?->cuit ? preg_replace('/\D/', '', $customer->cuit) : null;

        if (empty($cuit)) {
            $label = $forceRI
                ? 'Factura A'
                : "cliente con condición '{$ivaCondition}'";
            throw new RuntimeException(
                "El {$label} requiere CUIT del receptor. Registre el CUIT del cliente."
            );
        }

        if (strlen($cuit) !== 11 || ! ctype_digit($cuit)) {
            throw new RuntimeException(
                "CUIT inválido: debe tener exactamente 11 dígitos numéricos (recibido: '{$cuit}')."
            );
        }

        $condicionIVA = match ($ivaCondition) {
            'responsable_inscripto' => 1,
            'monotributista' => 6,
            'exento' => 4,
            default => 1, // Factura A siempre RI
        };

        return [80, (int) $cuit, $condicionIVA];
    }

    private function assertCompanyReady(Company $company): void
    {
        $errors = [];

        if (empty($company->cuit)) {
            $errors[] = 'CUIT de la empresa no configurado.';
        }
        $certPath = $company->afipCertPath($this->environment);
        if (empty($certPath) || ! file_exists($certPath)) {
            $errors[] = 'Certificado AFIP no encontrado. Cargarlo en Configuración → AFIP.';
        }
        if (empty($company->afip_key_path) || ! file_exists($company->afip_key_path)) {
            $errors[] = 'Clave privada AFIP no encontrada. Cargarla en Configuración → AFIP.';
        }
        if (! AfipPointOfSale::where('company_id', $company->id)->where('is_active', true)->exists()) {
            $errors[] = 'No hay ningún punto de venta AFIP configurado. Agregá uno en Configuración → AFIP.';
        }

        if (! empty($errors)) {
            throw new RuntimeException(implode(' | ', $errors));
        }
    }

    /**
     * Resuelve el punto de venta a usar: el asignado a la sucursal de la
     * venta, o el is_default de la empresa si la sucursal no tiene uno
     * propio (o la venta no tiene sucursal, ej. e-commerce).
     */
    private function resolvePointSale(Company $company, ?int $branchId): int
    {
        $pointOfSale = AfipPointOfSale::resolveFor($company->id, $branchId);

        if (! $pointOfSale) {
            throw new RuntimeException('No hay ningún punto de venta AFIP configurado para esta empresa.');
        }

        return $pointOfSale->point_sale;
    }
}
