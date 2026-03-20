<?php

namespace App\Services;

use App\Models\EcommerceOrder;
use App\Models\EcommercePaymentConfig;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoRefundService
{
    /**
     * Attempt a full refund for a paid MercadoPago order.
     *
     * Returns true if refunded successfully, false otherwise.
     * On failure the order's payment_status is set to 'refund_failed' and
     * the error is logged so an admin can act on it manually.
     */
    public function refund(EcommerceOrder $order): bool
    {
        if (
            $order->payment_status !== 'paid' ||
            $order->selected_payment_method !== 'mercadopago' ||
            ! $order->mp_payment_id
        ) {
            return false;
        }

        $accessToken = $this->resolveAccessToken();

        if (empty($accessToken)) {
            Log::error('MercadoPago refund skipped: no access token configured.', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
            ]);

            $order->update(['payment_status' => 'refund_failed']);

            return false;
        }

        $response = Http::withToken($accessToken)
            ->when(! app()->isProduction(), fn ($h) => $h->withoutVerifying())
            ->post("https://api.mercadopago.com/v1/payments/{$order->mp_payment_id}/refunds");

        if ($response->successful()) {
            $order->update(['payment_status' => 'refunded']);

            return true;
        }

        Log::error('MercadoPago refund failed.', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'mp_payment_id' => $order->mp_payment_id,
            'http_status' => $response->status(),
            'response_body' => $response->body(),
        ]);

        $order->update(['payment_status' => 'refund_failed']);

        return false;
    }

    private function resolveAccessToken(): string
    {
        $mpConfig = EcommercePaymentConfig::query()
            ->where('type', 'mercadopago')
            ->first();

        return ($mpConfig && ! empty($mpConfig->config['access_token']))
            ? $mpConfig->config['access_token']
            : (string) config('services.mercadopago.access_token', '');
    }
}
