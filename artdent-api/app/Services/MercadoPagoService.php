<?php

namespace App\Services;

use App\Models\EcommerceOrder;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoService
{
    protected string $accessToken;
    protected string $publicKey;
    protected bool $isProduction;

    public function __construct()
    {
        $this->accessToken = config('services.mercadopago.access_token');
        $this->publicKey = config('services.mercadopago.public_key');
        $this->isProduction = config('services.mercadopago.production', false);
    }

    /**
     * Create payment preference for checkout
     */
    public function createPreference(EcommerceOrder $order, array $options = []): array
    {
        $items = $order->items->map(function ($item) {
            return [
                'id' => (string) $item->product_id,
                'title' => $item->name,
                'description' => $item->name,
                'quantity' => (int) $item->qty,
                'unit_price' => (float) $item->unit_price,
                'currency_id' => 'ARS',
            ];
        })->toArray();

        $payload = [
            'items' => $items,
            'payer' => [
                'name' => $order->customer_name,
                'email' => $order->customer_email,
                'phone' => [
                    'number' => $order->customer_phone ?? '',
                ],
                'address' => [
                    'street_name' => $order->shipping_address ?? '',
                ],
            ],
            'back_urls' => [
                'success' => $options['success_url'] ?? config('app.frontend_url') . '/pedido/' . $order->code . '?payment=success',
                'failure' => $options['failure_url'] ?? config('app.frontend_url') . '/pedido/' . $order->code . '?payment=failure',
                'pending' => $options['pending_url'] ?? config('app.frontend_url') . '/pedido/' . $order->code . '?payment=pending',
            ],
            'auto_return' => 'approved',
            'external_reference' => $order->code,
            'notification_url' => $options['webhook_url'] ?? config('app.url') . '/api/webhooks/mercadopago',
            'statement_descriptor' => 'ARTDENT',
            'expires' => true,
            'expiration_date_from' => now()->toIso8601String(),
            'expiration_date_to' => now()->addHours(24)->toIso8601String(),
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Content-Type' => 'application/json',
        ])->post('https://api.mercadopago.com/checkout/preferences', $payload);

        if (!$response->successful()) {
            Log::error('MercadoPago preference creation failed', [
                'order_id' => $order->id,
                'response' => $response->json(),
            ]);
            throw new \Exception('No se pudo crear la preferencia de pago: ' . $response->body());
        }

        $data = $response->json();

        // Store transaction
        PaymentTransaction::create([
            'company_id' => $order->company_id,
            'order_id' => $order->id,
            'gateway' => 'mercadopago',
            'preference_id' => $data['id'],
            'amount' => $order->total,
            'currency' => 'ARS',
            'status' => 'pending',
            'metadata' => $data,
        ]);

        return [
            'preference_id' => $data['id'],
            'init_point' => $data['init_point'], // Redirect URL for web
            'sandbox_init_point' => $data['sandbox_init_point'], // For testing
        ];
    }

    /**
     * Get payment information
     */
    public function getPayment(string $paymentId): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->accessToken,
        ])->get("https://api.mercadopago.com/v1/payments/{$paymentId}");

        if (!$response->successful()) {
            throw new \Exception('No se pudo obtener información del pago');
        }

        return $response->json();
    }

    /**
     * Process webhook notification
     */
    public function processWebhook(array $data): void
    {
        $type = $data['type'] ?? null;
        $paymentId = $data['data']['id'] ?? null;

        if ($type !== 'payment' || !$paymentId) {
            Log::warning('MercadoPago webhook ignored', ['data' => $data]);
            return;
        }

        // Get payment details
        $payment = $this->getPayment($paymentId);
        
        $externalReference = $payment['external_reference'] ?? null;
        if (!$externalReference) {
            Log::error('MercadoPago payment without external_reference', ['payment_id' => $paymentId]);
            return;
        }

        // Find order
        $order = EcommerceOrder::where('code', $externalReference)->first();
        if (!$order) {
            Log::error('Order not found for payment', ['code' => $externalReference]);
            return;
        }

        // Update or create transaction
        $transaction = PaymentTransaction::updateOrCreate(
            [
                'order_id' => $order->id,
                'transaction_id' => $paymentId,
            ],
            [
                'company_id' => $order->company_id,
                'gateway' => 'mercadopago',
                'amount' => $payment['transaction_amount'],
                'currency' => $payment['currency_id'],
                'status' => $payment['status'],
                'status_detail' => $payment['status_detail'] ?? null,
                'payment_method_id' => $payment['payment_method_id'] ?? null,
                'payment_type_id' => $payment['payment_type_id'] ?? null,
                'payer_email' => $payment['payer']['email'] ?? null,
                'payer_data' => $payment['payer'] ?? null,
                'webhook_received_at' => now(),
                'webhook_data' => $payment,
            ]
        );

        // Update order payment status
        if ($payment['status'] === 'approved') {
            $order->update([
                'payment_method' => 'mercadopago',
                'payment_status' => 'paid',
                'paid_at' => now(),
                'current_status' => 'confirmed',
            ]);

            // TODO: Send confirmation email
            // TODO: Update stock
            // TODO: Create notification
        } elseif (in_array($payment['status'], ['rejected', 'cancelled'])) {
            $order->update([
                'payment_status' => 'failed',
            ]);
        }
    }

    /**
     * Refund payment
     */
    public function refund(string $paymentId, ?float $amount = null): array
    {
        $payload = $amount ? ['amount' => $amount] : [];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Content-Type' => 'application/json',
        ])->post("https://api.mercadopago.com/v1/payments/{$paymentId}/refunds", $payload);

        if (!$response->successful()) {
            throw new \Exception('No se pudo procesar el reembolso');
        }

        return $response->json();
    }
}
