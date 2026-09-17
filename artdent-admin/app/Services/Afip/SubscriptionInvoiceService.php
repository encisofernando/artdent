<?php

namespace App\Services\Afip;

use App\Models\AfipIssuerSetting;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\Tenant;
use App\Models\TenantPayment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Emite el comprobante AFIP que ArtCode le envía a un tenant por su
 * suscripción SaaS.
 * Soporta emisión automática (MercadoPago) y manual (Transferencia, QR, Efectivo).
 */
class SubscriptionInvoiceService
{
    public const CBTE_TIPO = [
        'FA' => 1, 'NCA' => 2, 'NDA' => 3,
        'FB' => 6, 'NCB' => 7, 'NDB' => 8,
        'FC' => 11, 'NCC' => 12, 'NDC' => 13,
    ];

    private const IVA_RATE = 21.0;
    private const IVA_CODE_21 = 5;

    private AfipIssuerSetting $issuer;
    private WsaaService $wsaa;
    private WsfevService $wsfev;

    public function __construct(?AfipIssuerSetting $issuer = null)
    {
        $this->issuer = $issuer ?? AfipIssuerSetting::current()
            ?? throw new RuntimeException('No hay una identidad AFIP configurada para facturar suscripciones.');

        $this->wsaa = new WsaaService($this->issuer->environment);
        $this->wsfev = new WsfevService($this->issuer->environment);
    }

    /**
     * Emite una factura para un TenantPayment registrado.
     *
     * @param array<string, mixed> $options
     */
    public function generateForTenantPayment(TenantPayment $payment, array $options = []): SubscriptionInvoice
    {
        $tenant = $payment->tenant ?: Tenant::findOrFail($payment->tenant_id);
        $subscription = $payment->subscription;

        $amount = (float) ($options['amount'] ?? $payment->amount);
        $description = (string) ($options['description'] ?? $payment->notes ?? "Suscripción {$payment->plan?->name} — ".($payment->paid_at ? $payment->paid_at->translatedFormat('F Y') : now()->translatedFormat('F Y')));

        $options['tenant_payment_id'] = $payment->id;

        $invoice = $this->issueInvoice($tenant, $subscription, $amount, $description, $options);

        $payment->update([
            'subscription_invoice_id' => $invoice->id,
        ]);

        return $invoice;
    }

    /**
     * Genera un comprobante por un pago de suscripción ya aprobado en MercadoPago o manual.
     *
     * @param float $amount Monto total cobrado (IVA incluido)
     * @param array<string, mixed> $options
     */
    public function generateForPayment(
        Tenant $tenant,
        ?Subscription $subscription,
        float $amount,
        string $description,
        ?string $mpPaymentId = null,
        array $options = []
    ): SubscriptionInvoice {
        if ($mpPaymentId) {
            $options['mp_payment_id'] = $mpPaymentId;
        }

        return $this->issueInvoice($tenant, $subscription, $amount, $description, $options);
    }

    /**
     * Emite un comprobante directo para un tenant.
     *
     * @param array<string, mixed> $options
     */
    public function generateDirectInvoice(
        Tenant $tenant,
        float $amount,
        string $description,
        array $options = []
    ): SubscriptionInvoice {
        $subscription = $tenant->activeSubscription();

        return $this->issueInvoice($tenant, $subscription, $amount, $description, $options);
    }

    /**
     * Núcleo de emisión ante AFIP.
     *
     * @param array<string, mixed> $options
     */
    private function issueInvoice(
        Tenant $tenant,
        ?Subscription $subscription,
        float $amount,
        string $description,
        array $options = []
    ): SubscriptionInvoice {
        $this->assertIssuerReady();

        $recipientName = trim((string) ($options['recipient_name'] ?? $tenant->name));
        $rawDoc = preg_replace('/\D/', '', (string) ($options['recipient_cuit'] ?? ''));
        $recipientCuit = ! empty($rawDoc) ? $rawDoc : null;
        $recipientIva = (string) ($options['recipient_iva'] ?? 'consumidor_final');

        // Determinar tipo de comprobante
        $receiptKey = $this->resolveReceiptKey($options['receipt_type'] ?? null, $recipientIva, $recipientCuit);
        $cbteTipo = self::CBTE_TIPO[$receiptKey];
        $pointSale = (int) ($options['point_sale'] ?? $this->issuer->point_sale);
        $issuerCuit = preg_replace('/\D/', '', $this->issuer->cuit);

        // Monotributista: Factura C sin discriminación de IVA.
        // Responsable Inscripto: Factura A o B con IVA 21%.
        $isMonotributo = ($this->issuer->iva_condition === 'monotributista' || in_array($receiptKey, ['FC', 'NCC', 'NDC']));

        if ($isMonotributo) {
            $neto = round($amount, 2);
            $iva = 0.0;
            $ivaItems = [];
        } else {
            $neto = round($amount / (1 + self::IVA_RATE / 100), 2);
            $iva = round($amount - $neto, 2);
            $ivaItems = [['Id' => self::IVA_CODE_21, 'BaseImp' => $neto, 'Importe' => $iva]];
        }

        // Resolución de documento del receptor
        [$docTipo, $docNro] = $this->resolveDoc($recipientCuit);
        $ivaReceptor = $this->resolveIvaReceptorCode($recipientIva);

        $date = now()->format('Ymd');
        $serviceFrom = $options['service_from'] ?? now()->startOfMonth()->format('Ymd');
        $serviceTo = $options['service_to'] ?? now()->format('Ymd');
        $dueDate = $options['due_date'] ?? now()->format('Ymd');

        $auth = $this->wsaa->getAuth($issuerCuit, $this->issuer->certPath(), $this->issuer->key_path);
        $lastNumber = $this->wsfev->getLastNumber($auth, $issuerCuit, $pointSale, $cbteTipo);
        $nextNumber = $lastNumber + 1;

        $invoiceData = [
            'point_sale' => $pointSale,
            'cbte_tipo' => $cbteTipo,
            'number' => $nextNumber,
            'date' => $date,
            'total' => round($amount, 2),
            'neto' => $neto,
            'op_ex' => 0,
            'iva_total' => $iva,
            'iva_items' => $ivaItems,
            'doc_tipo' => $docTipo,
            'doc_nro' => $docNro,
            'iva_receptor' => $ivaReceptor,
            'concepto' => 2, // Servicios
            'fch_serv_desde' => $serviceFrom,
            'fch_serv_hasta' => $serviceTo,
            'due_date' => $dueDate,
        ];

        DB::beginTransaction();
        $invoice = null;

        try {
            $invoice = SubscriptionInvoice::create([
                'tenant_id' => $tenant->id,
                'tenant_subscription_id' => $subscription?->id,
                'tenant_payment_id' => $options['tenant_payment_id'] ?? null,
                'mp_payment_id' => $options['mp_payment_id'] ?? null,
                'receipt_type' => $receiptKey,
                'point_sale' => $pointSale,
                'number' => $nextNumber,
                'recipient_name' => $recipientName,
                'recipient_cuit' => $recipientCuit,
                'description' => $description,
                'subtotal' => $neto,
                'tax_amount' => $iva,
                'total' => $amount,
                'status' => 'pending',
                'environment' => $this->issuer->environment,
                'afip_request' => $invoiceData,
                'issued_at' => now(),
            ]);

            $caeData = $this->wsfev->requestCae($auth, $issuerCuit, $invoiceData);

            $invoice->update([
                'number' => $caeData['number'],
                'cae' => $caeData['cae'],
                'cae_expiry' => $caeData['cae_expiry'],
                'status' => 'authorized',
                'afip_observations' => $caeData['observations'] ?: null,
                'afip_response' => $caeData,
            ]);

            DB::commit();

            Log::info('Factura AFIP de suscripción emitida con éxito', [
                'invoice_id' => $invoice->id,
                'tenant_id' => $tenant->id,
                'receipt_type' => $receiptKey,
                'number' => $caeData['number'],
                'cae' => $caeData['cae'],
            ]);

            return $invoice->fresh();
        } catch (\Throwable $e) {
            DB::rollBack();

            if ($invoice) {
                $invoice->update(['status' => 'failed', 'afip_error_msg' => $e->getMessage()]);
            }

            Log::error('Error al emitir factura AFIP de suscripción', [
                'tenant_id' => $tenant->id,
                'error' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function resolveReceiptKey(?string $requestedType, string $recipientIva, ?string $recipientCuit): string
    {
        if ($this->issuer->iva_condition === 'monotributista') {
            return 'FC';
        }

        if ($requestedType && isset(self::CBTE_TIPO[strtoupper($requestedType)])) {
            return strtoupper($requestedType);
        }

        // Si es Responsable Inscripto y el receptor tiene CUIT y es RI -> Factura A
        if ($recipientIva === 'responsable_inscripto' && ! empty($recipientCuit) && strlen($recipientCuit) === 11) {
            return 'FA';
        }

        // Caso general para RI -> Factura B
        return 'FB';
    }

    /**
     * @return array{0: int, 1: int|string}
     */
    private function resolveDoc(?string $cuit): array
    {
        if (empty($cuit)) {
            return [99, 0]; // Consumidor Final sin documento
        }

        $digits = strlen($cuit);
        if ($digits === 11) {
            return [80, (int) $cuit]; // CUIT
        }

        if ($digits >= 7 && $digits <= 8) {
            return [96, (int) $cuit]; // DNI
        }

        return [99, 0];
    }

    private function resolveIvaReceptorCode(string $ivaCondition): int
    {
        return match ($ivaCondition) {
            'responsable_inscripto' => 1,
            'exento' => 4,
            'monotributista' => 6,
            default => 5, // Consumidor Final (RG 5616)
        };
    }

    private function assertIssuerReady(): void
    {
        $errors = [];

        if (empty($this->issuer->cuit)) {
            $errors[] = 'CUIT del emisor no configurado.';
        }

        $certPath = $this->issuer->certPath();
        if (empty($certPath) || ! file_exists($certPath)) {
            $errors[] = 'Certificado AFIP del emisor no encontrado.';
        }

        if (empty($this->issuer->key_path) || ! file_exists($this->issuer->key_path)) {
            $errors[] = 'Clave privada AFIP del emisor no encontrada.';
        }

        if (empty($this->issuer->point_sale)) {
            $errors[] = 'Punto de venta del emisor no configurado.';
        }

        if (! empty($errors)) {
            throw new RuntimeException(implode(' | ', $errors));
        }
    }
}
