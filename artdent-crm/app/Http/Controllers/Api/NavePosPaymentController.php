<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\NaveChargeIntent;
use App\Models\Sale;
use App\Services\CustomerAccountPaymentService;
use App\Services\CustomerAccountSaleAllocator;
use App\Services\NaveService;
use App\Services\SalePaymentService;
use App\Support\CompanyContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Cobro presencial/remoto por Nave (QR físico y link de pago) desde el POS
 * (Sale/Create) y desde cuentas corrientes de clientes — distinto de
 * NavePaymentController, que es el checkout online de e-commerce.
 *
 * El estado del pago vive en NaveChargeIntent hasta que Nave confirma la
 * aprobación; recién ahí se crea el SalePayment/CustomerAccountMove real,
 * reutilizando SalePaymentService/CustomerAccountPaymentService (el mismo
 * código que usa el cobro manual).
 */
class NavePosPaymentController extends Controller
{
    public function __construct(private readonly NaveService $nave) {}

    public function createForSale(Request $request, Sale $sale, CustomerAccountSaleAllocator $allocator): JsonResponse
    {
        $request->validate([
            'type' => ['required', 'in:static_qr,payment_link'],
        ]);

        $amount = $allocator->outstandingAmount($sale);
        if ($amount <= 0.0) {
            return response()->json(['message' => 'La venta ya no tiene saldo pendiente.'], 422);
        }

        $products = $sale->sale_items->map(fn ($item) => [
            'name' => $item->product_name,
            'quantity' => (float) $item->quantity,
            'unit_price' => (float) $item->unit_price,
        ])->values()->toArray();

        if (empty($products)) {
            $products = [['name' => "Venta {$sale->sale_number}", 'quantity' => 1, 'unit_price' => $amount]];
        }

        return $this->createIntent(
            payableType: NaveChargeIntent::PAYABLE_SALE,
            payableId: $sale->id,
            type: $request->string('type')->toString(),
            amount: $amount,
            products: $products,
            description: "Venta {$sale->sale_number}",
        );
    }

    public function createForCustomerAccount(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:static_qr,payment_link'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'sale_id' => ['nullable', 'integer', 'exists:sales,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'send_email' => ['nullable', 'boolean'],
        ]);

        $amount = (float) $validated['amount'];
        $description = $validated['description'] ?? "Pago cuenta corriente — {$customer->name}";

        return $this->createIntent(
            payableType: NaveChargeIntent::PAYABLE_CUSTOMER_ACCOUNT,
            payableId: $customer->id,
            type: $validated['type'],
            amount: $amount,
            products: [['name' => $description, 'quantity' => 1, 'unit_price' => $amount]],
            description: $description,
            metadata: [
                'sale_id' => $validated['sale_id'] ?? null,
                'send_email' => (bool) ($validated['send_email'] ?? false),
            ],
        );
    }

    /**
     * Estado del intent, consultado por el frontend cada ~10s mientras el
     * modal de QR está abierto. No confía ciegamente en el webhook: si el
     * intent sigue 'pending' acá, también consulta el estado real contra
     * Nave y se auto-corrige — confirmado en producción (2026-08-11) que
     * Nave puede aceptar y guardar la notification_url correcta y aun así
     * nunca llamarla (el pago quedó APPROVED del lado de Nave pero el
     * webhook jamás llegó). Sin este fallback, una venta ya cobrada de
     * verdad se queda "Pendiente" para siempre en el CRM.
     */
    public function status(NaveChargeIntent $intent): JsonResponse
    {
        if ($intent->company_id !== CompanyContext::id()) {
            abort(404);
        }

        if ($intent->status === NaveChargeIntent::STATUS_PENDING && $intent->payment_request_id) {
            $this->reconcileFromNave($intent);
            $intent->refresh();
        }

        return response()->json(['status' => $intent->status]);
    }

    /**
     * Consulta el payment_request en Nave y aplica el mismo mapeo/transacción
     * que el webhook si ya hay un pago resuelto — mismo criterio de lock que
     * webhook() para no duplicar el registro de pago si ambos caminos
     * (webhook real + este fallback) llegan a coincidir.
     */
    private function reconcileFromNave(NaveChargeIntent $intent): void
    {
        try {
            $paymentRequest = $this->nave->getPaymentRequest($intent->payment_request_id);
            $naveStatus = $paymentRequest['payment']['status']['name'] ?? null;
            $paymentId = $paymentRequest['payment']['id'] ?? null;

            if (! $naveStatus || ! $paymentId) {
                return;
            }

            $this->applyNaveStatus($intent, $naveStatus, $paymentId);
        } catch (\Throwable $e) {
            // No relanzar: el polling del frontend sigue funcionando con el
            // status actual, se reintenta solo en la próxima consulta.
            Log::channel('nave')->error('Nave POS: error al reconciliar desde status().', [
                'intent_id' => $intent->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Webhook de Nave para cobro presencial/remoto (QR/link) — distinto del
     * webhook de checkout online (NavePaymentController::webhook). Recibe
     * {payment_id, payment_check_url, external_payment_id}. external_payment_id
     * viene con el formato "posqr-{intent_id}" para identificar el intent sin
     * ambigüedad frente al otro webhook (que usa order_number).
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::channel('nave')->info('Nave POS: webhook recibido.', $request->all());

        $paymentId = $request->input('payment_id');
        $externalId = (string) $request->input('external_payment_id');

        if (! $paymentId || ! str_starts_with($externalId, 'posqr-')) {
            return response()->json(['ok' => true]);
        }

        $intentId = (int) substr($externalId, strlen('posqr-'));
        $intent = NaveChargeIntent::find($intentId);

        if (! $intent) {
            Log::channel('nave')->warning('Nave POS: webhook para intent inexistente.', ['intent_id' => $intentId]);

            return response()->json(['ok' => true]);
        }

        // El secret viaja como query param en la notification_url que mandamos
        // al crear el intent. No es estrictamente obligatorio en la request
        // porque todavía no está confirmado que Nave respete la
        // notification_url dinámica por request (vs. la registrada una sola
        // vez en el alta con soporte) — si viene, se valida; si no viene, se
        // sigue procesando por external_payment_id igual que el webhook de
        // checkout online, que no valida ninguna firma.
        $secret = $request->query('secret');
        if ($secret !== null && ! hash_equals($intent->webhook_secret, (string) $secret)) {
            Log::channel('nave')->error('Nave POS: secret inválido en webhook.', ['intent_id' => $intentId]);

            return response()->json(['error' => 'invalid_secret'], 401);
        }

        if ($intent->status !== NaveChargeIntent::STATUS_PENDING) {
            return response()->json(['ok' => true]);
        }

        $payment = $this->nave->getPaymentInternal($paymentId);
        if (! $payment) {
            Log::channel('nave')->error('Nave POS: no se pudo obtener el pago.', ['payment_id' => $paymentId]);

            return response()->json(['ok' => true]);
        }

        $naveStatus = $payment['status']['name'] ?? null;

        try {
            $this->applyNaveStatus($intent, $naveStatus, $paymentId);
        } catch (\Throwable $e) {
            Log::channel('nave')->error('Nave POS: error al procesar webhook.', [
                'intent_id' => $intent->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Internal error'], 500);
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Mapea el status de Nave a nuestro status interno y, si corresponde,
     * aplica el pago — con el mismo lock que usaba antes sólo webhook(), para
     * que el webhook real y el fallback de reconcileFromNave() nunca dupliquen
     * el registro de pago si llegan a coincidir.
     */
    private function applyNaveStatus(NaveChargeIntent $intent, ?string $naveStatus, string $paymentId): void
    {
        $newStatus = match ($naveStatus) {
            'APPROVED' => NaveChargeIntent::STATUS_APPROVED,
            'REJECTED' => NaveChargeIntent::STATUS_REJECTED,
            'CANCELLED' => NaveChargeIntent::STATUS_CANCELLED,
            default => null,
        };

        if (! $newStatus) {
            return;
        }

        DB::transaction(function () use ($intent, $newStatus, $paymentId) {
            $locked = NaveChargeIntent::whereKey($intent->id)->lockForUpdate()->first();

            if (! $locked || $locked->status !== NaveChargeIntent::STATUS_PENDING) {
                return;
            }

            $locked->update(['status' => $newStatus, 'nave_payment_id' => $paymentId]);

            if ($newStatus === NaveChargeIntent::STATUS_APPROVED) {
                $this->applyApprovedIntent($locked);
            }
        });
    }

    private function applyApprovedIntent(NaveChargeIntent $intent): void
    {
        if ($intent->payable_type === NaveChargeIntent::PAYABLE_SALE) {
            $sale = Sale::find($intent->payable_id);
            if (! $sale) {
                return;
            }

            app(SalePaymentService::class)->registerPayment(
                $sale,
                $intent->amount,
                null,
                $intent->description,
            );

            return;
        }

        $customer = Customer::find($intent->payable_id);
        if (! $customer) {
            return;
        }

        $metadata = $intent->metadata ?? [];

        app(CustomerAccountPaymentService::class)->registerPayment(
            $customer,
            $intent->company_id,
            $intent->amount,
            null,
            $metadata['sale_id'] ?? null,
            $intent->description,
            null,
            (bool) ($metadata['send_email'] ?? false),
        );
    }

    /**
     * @param  array<int, array{name: string, quantity: float, unit_price: float}>  $products
     * @param  array<string, mixed>  $metadata
     */
    private function createIntent(
        string $payableType,
        int $payableId,
        string $type,
        float $amount,
        array $products,
        string $description,
        array $metadata = [],
    ): JsonResponse {
        $posId = $type === NaveChargeIntent::TYPE_STATIC_QR
            ? $this->nave->posIdQr()
            : $this->nave->posId();

        if (! $posId) {
            return response()->json(['message' => 'Nave no está configurado (falta el POS ID).'], 422);
        }

        $intent = NaveChargeIntent::create([
            'company_id' => CompanyContext::id(),
            'payable_type' => $payableType,
            'payable_id' => $payableId,
            'nave_payment_type' => $type,
            'pos_id' => $posId,
            'amount' => $amount,
            'description' => $description,
            'status' => NaveChargeIntent::STATUS_PENDING,
            'webhook_secret' => Str::random(40),
            'metadata' => $metadata,
        ]);

        $notificationUrl = route('api.payment.nave.pos.webhook', ['secret' => $intent->webhook_secret]);

        $intentParams = [
            'external_payment_id' => "posqr-{$intent->id}",
            'amount' => $amount,
            'products' => $products,
            'notification_url' => $notificationUrl,
            'duration_time' => 900,
        ];

        $result = $type === NaveChargeIntent::TYPE_STATIC_QR
            ? $this->nave->createStaticQrIntent($intentParams)
            : $this->nave->createPaymentLinkIntent($intentParams);

        if (! $result) {
            $intent->update(['status' => NaveChargeIntent::STATUS_CANCELLED]);

            return response()->json(['message' => 'No se pudo crear la intención de pago con Nave.'], 502);
        }

        $intent->update(['payment_request_id' => $result['id'] ?? null]);

        return response()->json([
            'intent_id' => $intent->id,
            'qr_data' => $result['qr_data'] ?? null,
            'checkout_url' => $result['checkout_url'] ?? null,
        ]);
    }
}
