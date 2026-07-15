<?php

namespace App\Services\Afip;

use App\Models\AfipIssuerSetting;
use App\Models\Subscription;
use App\Models\SubscriptionInvoice;
use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Emite el comprobante AFIP que ArtCode le envía a un tenant por su
 * suscripción SaaS. Estructuralmente calcado de artdent-crm's AfipService
 * (WSAA → último número → CAE), pero con una sola línea de "servicio" en vez
 * de desglosar sale_items, y usando la identidad de AfipIssuerSetting (fija,
 * una sola fila) en vez de la Company por-tenant.
 */
class SubscriptionInvoiceService
{
    private const CBTE_TIPO = [
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
     * Genera un comprobante por un pago de suscripción ya aprobado en MercadoPago.
     *
     * @param  float  $amount  Monto total cobrado (IVA incluido)
     */
    public function generateForPayment(
        Tenant $tenant,
        ?Subscription $subscription,
        float $amount,
        string $description,
        ?string $mpPaymentId = null,
    ): SubscriptionInvoice {
        $this->assertIssuerReady();

        $receiptKey = $this->resolveReceiptType();
        $cbteTipo = self::CBTE_TIPO[$receiptKey];
        $pointSale = $this->issuer->point_sale;
        $cuit = preg_replace('/\D/', '', $this->issuer->cuit);

        $auth = $this->wsaa->getAuth($cuit, $this->issuer->certPath(), $this->issuer->key_path);
        $lastNumber = $this->wsfev->getLastNumber($auth, $cuit, $pointSale, $cbteTipo);
        $nextNumber = $lastNumber + 1;

        // Servicio gravado al 21% — el monto cobrado por MP incluye IVA.
        $neto = round($amount / (1 + self::IVA_RATE / 100), 2);
        $iva = round($amount - $neto, 2);

        $date = now()->format('Ymd');

        $invoiceData = [
            'point_sale' => $pointSale,
            'cbte_tipo' => $cbteTipo,
            'number' => $nextNumber,
            'date' => $date,
            'total' => round($amount, 2),
            'neto' => $neto,
            'op_ex' => 0,
            'iva_total' => $iva,
            'iva_items' => [['Id' => self::IVA_CODE_21, 'BaseImp' => $neto, 'Importe' => $iva]],
            'doc_tipo' => 99, // Consumidor final — no capturamos CUIT del tenant hoy
            'doc_nro' => 0,
            'iva_receptor' => 5, // Consumidor Final (RG 5616)
            'concepto' => 2, // Servicios
        ];

        DB::beginTransaction();
        $invoice = null;

        try {
            $invoice = SubscriptionInvoice::create([
                'tenant_id' => $tenant->id,
                'tenant_subscription_id' => $subscription?->id,
                'mp_payment_id' => $mpPaymentId,
                'receipt_type' => $receiptKey,
                'point_sale' => $pointSale,
                'number' => $nextNumber,
                'recipient_name' => $tenant->name,
                'recipient_cuit' => null,
                'description' => $description,
                'subtotal' => $neto,
                'tax_amount' => $iva,
                'total' => $amount,
                'status' => 'pending',
                'environment' => $this->issuer->environment,
                'afip_request' => $invoiceData,
                'issued_at' => now(),
            ]);

            $caeData = $this->wsfev->requestCae($auth, $cuit, $invoiceData);

            $invoice->update([
                'number' => $caeData['number'],
                'cae' => $caeData['cae'],
                'cae_expiry' => $caeData['cae_expiry'],
                'status' => 'authorized',
                'afip_observations' => $caeData['observations'] ?: null,
                'afip_response' => $caeData,
            ]);

            DB::commit();

            Log::info('Factura AFIP de suscripción emitida', [
                'invoice_id' => $invoice->id,
                'tenant_id' => $tenant->id,
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

    private function resolveReceiptType(): string
    {
        return match ($this->issuer->iva_condition) {
            'monotributista' => 'FC',
            default => 'FB',
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
