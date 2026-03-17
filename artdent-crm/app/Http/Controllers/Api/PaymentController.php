<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EcommerceOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    private function accessToken(): string
    {
        return config('services.mercadopago.access_token', '');
    }

    private function ecommerceUrl(): string
    {
        return rtrim(config('services.mercadopago.ecommerce_url', config('app.url')), '/');
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
        $type = $request->input('type') ?? $request->input('topic');
        $dataId = $request->input('data.id') ?? $request->input('id');

        if ($type !== 'payment' || ! $dataId) {
            return response()->json(['ok' => true]);
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

        $order = EcommerceOrder::query()
            ->where('order_number', $externalRef)
            ->first();

        if (! $order) {
            return response()->json(['ok' => true]);
        }

        $paymentStatus = match ($mpStatus) {
            'approved' => 'paid',
            'rejected' => 'failed',
            'refunded' => 'refunded',
            default => $order->payment_status,
        };

        $orderStatus = $order->status;
        if ($mpStatus === 'approved' && in_array($order->status, ['pending', 'confirmed'])) {
            $orderStatus = 'confirmed';
        }

        $order->update([
            'payment_status' => $paymentStatus,
            'status' => $orderStatus,
        ]);

        Log::info('MercadoPago webhook processed', [
            'order' => $externalRef,
            'mp_status' => $mpStatus,
            'payment_status' => $paymentStatus,
        ]);

        return response()->json(['ok' => true]);
    }
}
