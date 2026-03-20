<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private function accessToken(): string
    {
        $mpConfig = \App\Models\EcommercePaymentConfig::query()
            ->where('type', 'mercadopago')
            ->first();

        if ($mpConfig && ! empty($mpConfig->config['access_token'])) {
            return $mpConfig->config['access_token'];
        }

        return config('services.mercadopago.access_token', '');
    }

    private function ecommerceUrl(): string
    {
        return rtrim(config('services.mercadopago.ecommerce_url', config('app.url')), '/');
    }

    private function webhookSecret(): string
    {
        $mpConfig = \App\Models\EcommercePaymentConfig::query()
            ->where('type', 'mercadopago')
            ->first();

        if ($mpConfig && ! empty($mpConfig->config['webhook_secret'])) {
            return $mpConfig->config['webhook_secret'];
        }

        return config('services.mercadopago.webhook_secret', '');
    }

    /**
     * Crea una preferencia de pago en MercadoPago y devuelve el init_point.
     */
    public function createPreference(Request $request): JsonResponse
    {
        $request->validate([
            'order_code' => ['required', 'string'],
        ]);

        $order = EcommerceOrder::query()
            ->with('ecommerce_order_items')
            ->where('order_number', $request->order_code)
            ->firstOrFail();

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'Este pedido ya fue pagado.'], 422);
        }

        // Send the exact order total as a single item to guarantee MP charges
        // the correct discounted amount (avoids rounding issues from multi-item ratios).
        $items = [
            [
                'id' => 'order-'.$order->order_number,
                'title' => 'Pedido #'.$order->order_number.' — ArtDent',
                'quantity' => 1,
                'unit_price' => (float) $order->total,
                'currency_id' => 'ARS',
            ],
        ];

        $ecommerceUrl = $this->ecommerceUrl();
        $apiUrl = rtrim(config('app.url'), '/');
        $isLocalhost = str_contains($ecommerceUrl, 'localhost') || str_contains($ecommerceUrl, '127.0.0.1');

        $backUrls = [
            'success' => "{$ecommerceUrl}/pedido/{$order->order_number}?mp=success",
            'failure' => "{$ecommerceUrl}/pedido/{$order->order_number}?mp=failure",
            'pending' => "{$ecommerceUrl}/pedido/{$order->order_number}?mp=pending",
        ];

        $payload = [
            'items' => $items,
            'external_reference' => $order->order_number,
            'back_urls' => $backUrls,
            'notification_url' => "{$apiUrl}/api/payment/mp/webhook",
            'payer' => [
                'name' => $order->shipping_name ?? '',
                'phone' => ['number' => $order->shipping_phone ?? ''],
            ],
        ];

        if (! $isLocalhost) {
            $payload['auto_return'] = 'approved';
        }

        Log::info('MercadoPago preference request', [
            'order' => $order->order_number,
            'total' => $order->total,
            'discount' => $order->discount_amount,
        ]);

        $response = Http::withToken($this->accessToken())
            ->when(! app()->isProduction(), fn ($h) => $h->withoutVerifying())
            ->post('https://api.mercadopago.com/checkout/preferences', $payload);

        if (! $response->successful()) {
            Log::error('MercadoPago preference error', [
                'order' => $order->order_number,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            return response()->json(['message' => 'No se pudo crear la preferencia de pago.'], 502);
        }

        $data = $response->json();

        return response()->json([
            'preference_id' => $data['id'],
            'init_point' => $data['init_point'],
            'sandbox_init_point' => $data['sandbox_init_point'] ?? null,
        ]);
    }

    /**
     * Webhook IPN de MercadoPago. Actualiza el estado de pago del pedido.
     */
    public function webhook(Request $request): JsonResponse
    {
        Log::channel('mercadopago')->info('Webhook IPN received', [
            'type' => $request->input('type') ?? $request->input('topic'),
            'id' => $request->input('data.id') ?? $request->input('id'),
            'request_id' => $request->header('x-request-id')
        ]);

        $type = $request->input('type') ?? $request->input('topic');
        $dataId = $request->input('data.id') ?? $request->input('id');

        if ($type !== 'payment' || ! $dataId) {
            return response()->json(['ok' => true]);
        }

        $signature = $request->header('x-signature');
        $requestId = $request->header('x-request-id');
        $webhookSecret = $this->webhookSecret();

        if ($signature && $requestId && $webhookSecret) {
            $parts = explode(',', $signature);
            $ts = null;
            $v1 = null;
            foreach ($parts as $part) {
                if (str_starts_with($part, 'ts=')) $ts = substr($part, 3);
                if (str_starts_with($part, 'v1=')) $v1 = substr($part, 3);
            }

            if ($ts && $v1) {
                $manifest = "id:{$dataId};request-id:{$requestId};ts:{$ts};";
                $hmac = hash_hmac('sha256', $manifest, $webhookSecret);
                if (!hash_equals($hmac, $v1)) {
                    Log::channel('mercadopago')->warning('MercadoPago webhook invalid signature.', ['request_id' => $requestId, 'signature' => $signature]);
                    return response()->json(['message' => 'Invalid signature'], 403);
                }
            }
        }

        $payment = Http::withToken($this->accessToken())
            ->when(! app()->isProduction(), fn ($h) => $h->withoutVerifying())
            ->get("https://api.mercadopago.com/v1/payments/{$dataId}")
            ->json();

        $externalRef = $payment['external_reference'] ?? null;
        $mpStatus = $payment['status'] ?? null;

        if (! $externalRef) {
            return response()->json(['ok' => true]);
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($externalRef, $mpStatus, $dataId, $payment) {
                $order = EcommerceOrder::query()
                    ->where('order_number', $externalRef)
                    ->lockForUpdate()
                    ->first();

                if (! $order) {
                    return;
                }

                $currentStatus = $order->payment_status;

                $paymentStatus = match ($mpStatus) {
                    'approved' => 'paid',
                    'pending', 'in_process' => 'pending',
                    'rejected', 'cancelled' => 'failed',
                    'refunded' => 'refunded',
                    default => $order->payment_status,
                };

                $orderStatus = $order->status;
                if ($mpStatus === 'approved' && in_array($order->status, ['pending', 'confirmed'])) {
                    $orderStatus = 'confirmed';
                }

                $updateData = [
                    'payment_status' => $paymentStatus,
                    'status' => $orderStatus,
                ];

                if ($mpStatus === 'approved' && ! empty($dataId)) {
                    $updateData['mp_payment_id'] = (string) $dataId;
                }

                $order->update($updateData);

                if ($paymentStatus === 'paid' && $currentStatus !== 'paid') {
                    $orderItems = $order->ecommerce_order_items;
                    $warehouseId = (int) env('ECOMMERCE_WAREHOUSE_ID', 1);
                    $hasSufficientStock = true;

                    $stockIdsToLock = [];
                    foreach ($orderItems as $item) {
                        $stockQuery = \App\Models\Stock::query()
                            ->where('product_id', $item->product_id)
                            ->where('warehouse_id', $warehouseId)
                            ->when($item->variant_id, fn($q) => $q->where('variant_id', $item->variant_id), fn($q) => $q->whereNull('variant_id'));
                        
                        $stock = $stockQuery->first();
                        if ($stock) {
                            $stockIdsToLock[] = $stock->id;
                        }
                    }

                    if (!empty($stockIdsToLock)) {
                        $lockedStocks = \App\Models\Stock::whereIn('id', $stockIdsToLock)
                            ->lockForUpdate()
                            ->get()
                            ->keyBy('id');
                            
                        // Verificamos si hay stock suficiente en los locks
                        foreach ($orderItems as $item) {
                            $stockId = null;
                            foreach ($lockedStocks as $ls) {
                                if ($ls->product_id === $item->product_id && $ls->variant_id === $item->variant_id && $ls->warehouse_id === $warehouseId) {
                                    $stockId = $ls->id;
                                    break;
                                }
                            }
                            
                            if (!$stockId || $lockedStocks[$stockId]->quantity < $item->quantity) {
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
                                ->when($item->variant_id, fn($q) => $q->where('variant_id', $item->variant_id), fn($q) => $q->whereNull('variant_id'))
                                ->decrement('quantity', $item->quantity);

                            \App\Services\StockAlertService::checkAndNotify($item->product_id, $item->variant_id, $warehouseId);
                        }
                    } else {
                        Log::channel('mercadopago')->warning('Stock insufficient for paid order. Marking as failed & refunding.', ['order' => $order->order_number]);
                        $order->update([
                            'status' => 'cancelled',
                            'customer_notes' => 'Cancelado automáticamente por falta de stock. Reembolso en proceso.',
                        ]);
                        app(\App\Services\MercadoPagoRefundService::class)->refund($order);
                    }

                    // CRM notification — payment approved
                    CrmNotification::create([
                        'type' => 'payment_approved',
                        'title' => 'Pago acreditado',
                        'body' => "Pedido #{$order->order_number} pagado con MercadoPago · $".number_format((float) $order->total, 0, ',', '.'),
                        'url' => '/ecommerce-orders/'.$order->id,
                        'order_code' => $order->order_number,
                    ]);

                    if ($order->customer_id) {
                        try {
                            \App\Jobs\SendWhatsAppNotification::dispatch(
                                $order->customer_id,
                                $order->company_id,
                                'payment_approved',
                                [
                                    ['type' => 'text', 'text' => $order->order_number]
                                ]
                            );
                        } catch (\Throwable $e) {
                            Log::channel('mercadopago')->error('WA Job Error (Webhook): ' . $e->getMessage());
                        }
                    }
                }

                Log::channel('mercadopago')->info('MercadoPago webhook processed', [
                    'order' => $externalRef,
                    'mp_status' => $mpStatus,
                    'payment_status' => $paymentStatus,
                    'payload' => $payment
                ]);
            });
        } catch (\Exception $e) {
            Log::channel('mercadopago')->error('MercadoPago webhook transaction failed.', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'external_reference' => $externalRef
            ]);
            return response()->json(['message' => 'Internal error'], 500);
        }

        return response()->json(['ok' => true]);
    }
}
