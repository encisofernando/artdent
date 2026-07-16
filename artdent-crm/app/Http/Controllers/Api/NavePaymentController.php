<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Services\NaveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class NavePaymentController extends Controller
{
    public function __construct(private readonly NaveService $nave) {}

    /**
     * Crea una intención de pago en Nave y retorna checkout_url + qr_data.
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => ['required', 'string'],
        ]);

        $order = EcommerceOrder::query()
            ->with('ecommerce_order_items.product')
            ->where('order_number', $request->order_code)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Este pedido ya fue pagado.'], 422);
        }

        $ecommerceUrl = rtrim(config('services.mercadopago.ecommerce_url', config('app.url')), '/');
        $callbackUrl = "{$ecommerceUrl}/pedido/{$order->order_number}?nave=success";

        $buyer = [];
        if ($order->shipping_name) {
            $buyer['name'] = $order->shipping_name;
        }
        if ($order->customer_email) {
            $buyer['user_email'] = $order->customer_email;
        }
        if ($order->guest_dni) {
            $cleanDoc = preg_replace('/\D/', '', $order->guest_dni);
            $buyer['doc_type'] = strlen($cleanDoc) === 11 ? 'CUIT' : 'DNI';
            $buyer['doc_number'] = $cleanDoc;
        }
        if ($order->shipping_city) {
            $buyer['billing_address'] = [
                'city' => $order->shipping_city,
                'region' => $order->shipping_province ?? '',
                'country' => 'AR',
                'zipcode' => $order->shipping_postal ?? '',
            ];
        }

        // Products: one item per order line
        $products = $order->ecommerce_order_items->map(function ($item): array {
            return [
                'name' => $item->product_name ?? ($item->product?->name ?? 'Producto'),
                'description' => $item->product_name ?? 'Sin descripción',
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
            ];
        })->values()->toArray();

        if (empty($products)) {
            $products = [[
                'name' => 'Pedido #'.$order->order_number,
                'description' => $order->company?->fantasy_name ?: $order->company?->name ?: 'ArtCode',
                'quantity' => 1,
                'unit_price' => (float) $order->total,
            ]];
        }

        $intent = $this->nave->createPaymentIntent([
            'external_payment_id' => $order->order_number,
            'amount' => (float) $order->total,
            'products' => $products,
            'buyer' => $buyer ?: null,
            'callback_url' => $callbackUrl,
            'duration_time' => 3600, // 1 hora
        ]);

        if (! $intent) {
            return response()->json(['message' => 'No se pudo crear la intención de pago con Nave.'], 502);
        }

        // Persist payment_request_id on the order for later polling
        $order->update([
            'nave_payment_request_id' => $intent['id'] ?? null,
        ]);

        return response()->json([
            'payment_request_id' => $intent['id'],
            'checkout_url' => $intent['checkout_url'],
            'qr_data' => $intent['qr_data'] ?? null,
        ]);
    }

    /**
     * Webhook de notificación de Nave.
     * Nave envía: { payment_id, payment_check_url, external_payment_id }
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::channel('nave')->info('Nave: webhook recibido.', $request->all());

        $paymentId = $request->input('payment_id');
        $externalId = $request->input('external_payment_id');

        if (! $paymentId || ! $externalId) {
            return response()->json(['ok' => true]);
        }

        // Fetch full payment status from Nave
        $payment = $this->nave->getPayment($paymentId);

        if (! $payment) {
            Log::channel('nave')->error('Nave: no se pudo obtener el pago.', ['payment_id' => $paymentId]);

            return response()->json(['ok' => true]);
        }

        $naveStatus = $payment['status']['name'] ?? null;

        Log::channel('nave')->info('Nave: estado del pago obtenido.', [
            'payment_id' => $paymentId,
            'external_id' => $externalId,
            'status' => $naveStatus,
        ]);

        try {
            DB::transaction(function () use ($externalId, $naveStatus, $paymentId) {
                $order = EcommerceOrder::query()
                    ->where('order_number', $externalId)
                    ->lockForUpdate()
                    ->first();

                if (! $order) {
                    return;
                }

                $currentStatus = $order->payment_status;

                $paymentStatus = match ($naveStatus) {
                    'APPROVED' => 'paid',
                    'PENDING' => 'pending',
                    'REJECTED' => 'failed',
                    'CANCELLED' => 'failed',
                    'REFUNDED' => 'refunded',
                    'PURCHASE_REVERSED' => 'refunded',
                    default => $order->payment_status,
                };

                $orderStatus = $order->status;
                if ($naveStatus === 'APPROVED' && in_array($order->status, ['pending', 'confirmed'])) {
                    $orderStatus = 'confirmed';
                }

                $order->update([
                    'payment_status' => $paymentStatus,
                    'status' => $orderStatus,
                    'nave_payment_id' => $paymentId,
                ]);

                if ($paymentStatus === 'paid' && $currentStatus !== 'paid') {
                    $this->handleApprovedPayment($order, $paymentId);
                }

                if ($paymentStatus === 'refunded' && $currentStatus !== 'refunded') {
                    try {
                        \App\Jobs\GenerateEcommerceCreditNoteJob::dispatch($order->id);
                    } catch (\Throwable $e) {
                        Log::channel('nave')->error('Nave: error al generar nota de crédito.', ['error' => $e->getMessage()]);
                    }
                }

                Log::channel('nave')->info('Nave: webhook procesado.', [
                    'order' => $externalId,
                    'nave_status' => $naveStatus,
                    'payment_status' => $paymentStatus,
                ]);
            });
        } catch (\Exception $e) {
            Log::channel('nave')->error('Nave: error en transacción del webhook.', [
                'error' => $e->getMessage(),
                'order' => $externalId,
            ]);

            try {
                CrmNotification::create([
                    'type' => 'payment_error',
                    'title' => 'Error crítico en Webhook de Nave',
                    'body' => "No se pudo procesar el pago del pedido #{$externalId}. Error: ".$e->getMessage(),
                    'url' => $externalId ? '/ecommerce-orders/search?q='.$externalId : '/ecommerce-orders',
                    'order_code' => $externalId,
                ]);
            } catch (\Throwable) {
            }

            return response()->json(['message' => 'Internal error'], 500);
        }

        return response()->json(['ok' => true]);
    }

    private function handleApprovedPayment(EcommerceOrder $order, string $paymentId): void
    {
        $warehouseId = (int) env('ECOMMERCE_WAREHOUSE_ID', 1);
        $orderItems = $order->ecommerce_order_items;
        $hasSufficientStock = true;

        $stockIdsToLock = [];
        foreach ($orderItems as $item) {
            $stock = \App\Models\Stock::query()
                ->where('product_id', $item->product_id)
                ->where('warehouse_id', $warehouseId)
                ->when($item->variant_id, fn ($q) => $q->where('variant_id', $item->variant_id), fn ($q) => $q->whereNull('variant_id'))
                ->first();

            if ($stock) {
                $stockIdsToLock[] = $stock->id;
            }
        }

        if (! empty($stockIdsToLock)) {
            $lockedStocks = \App\Models\Stock::whereIn('id', $stockIdsToLock)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($orderItems as $item) {
                $match = $lockedStocks->first(fn ($ls) => $ls->product_id === $item->product_id
                    && $ls->variant_id === $item->variant_id
                    && $ls->warehouse_id === $warehouseId
                );

                if (! $match || $match->quantity < $item->quantity) {
                    $hasSufficientStock = false;
                    break;
                }
            }
        } else {
            $hasSufficientStock = false;
        }

        if ($hasSufficientStock) {
            foreach ($orderItems as $item) {
                \App\Models\Stock::query()
                    ->where('product_id', $item->product_id)
                    ->where('warehouse_id', $warehouseId)
                    ->when($item->variant_id, fn ($q) => $q->where('variant_id', $item->variant_id), fn ($q) => $q->whereNull('variant_id'))
                    ->decrement('quantity', $item->quantity);

                \App\Services\StockAlertService::checkAndNotify($item->product_id, $item->variant_id, $warehouseId);
            }
        } else {
            Log::channel('nave')->warning('Nave: stock insuficiente para orden pagada.', ['order' => $order->order_number]);
            $order->update([
                'status' => 'cancelled',
                'customer_notes' => 'Cancelado automáticamente por falta de stock.',
            ]);
        }

        CrmNotification::create([
            'type' => 'payment_approved',
            'title' => 'Pago acreditado (Nave)',
            'body' => "Pedido #{$order->order_number} pagado con Nave · $".number_format((float) $order->total, 0, ',', '.'),
            'url' => '/ecommerce-orders/'.$order->id,
            'order_code' => $order->order_number,
        ]);

        try {
            \App\Jobs\GenerateEcommerceAfipInvoiceJob::dispatch($order->id);
        } catch (\Throwable $e) {
            Log::channel('nave')->error('Nave: error al despachar job de factura AFIP.', ['error' => $e->getMessage()]);
        }

        if ($order->customer_id) {
            try {
                \App\Jobs\SendWhatsAppNotification::dispatch(
                    $order->customer_id,
                    $order->company_id,
                    'payment_approved',
                    [['type' => 'text', 'text' => $order->order_number]]
                );
            } catch (\Throwable $e) {
                Log::channel('nave')->error('Nave: error al despachar notificación WA.', ['error' => $e->getMessage()]);
            }
        }
    }
}
