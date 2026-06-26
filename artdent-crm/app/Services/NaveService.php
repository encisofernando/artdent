<?php

namespace App\Services;

use App\Models\EcommercePaymentConfig;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NaveService
{
    private const AUTH_SANDBOX = 'https://homoservices.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate';

    private const AUTH_PROD = 'https://services.apinaranja.com/security-ms/api/security/auth0/b2b/m2msPrivate';

    private const API_SANDBOX = 'https://api-sandbox.ranty.io';

    private const API_PROD = 'https://api.ranty.io';

    private ?array $config = null;

    private function config(): array
    {
        if ($this->config === null) {
            $record = EcommercePaymentConfig::query()
                ->where('type', 'nave')
                ->first();

            $this->config = $record?->config ?? [];
        }

        return $this->config;
    }

    public function isSandbox(): bool
    {
        return (bool) ($this->config()['sandbox_mode'] ?? true);
    }

    private function authEndpoint(): string
    {
        return $this->isSandbox() ? self::AUTH_SANDBOX : self::AUTH_PROD;
    }

    private function apiBase(): string
    {
        return $this->isSandbox() ? self::API_SANDBOX : self::API_PROD;
    }

    private function audience(): string
    {
        return $this->config()['audience'] ?? 'https://naranja.com/ranty/merchants/api';
    }

    public function posId(): ?string
    {
        return $this->config()['pos_id'] ?? null;
    }

    /**
     * Obtiene un access_token con caché de 23 hs (el token dura 24 hs).
     */
    public function accessToken(): ?string
    {
        $cfg = $this->config();
        $clientId = $cfg['client_id'] ?? null;
        $clientSecret = $cfg['client_secret'] ?? null;

        if (! $clientId || ! $clientSecret) {
            Log::channel('nave')->error('Nave: credenciales no configuradas (client_id / client_secret).');

            return null;
        }

        $cacheKey = 'nave_access_token_'.md5($clientId);

        return Cache::remember($cacheKey, now()->addHours(23), function () use ($clientId, $clientSecret): ?string {
            $response = Http::post($this->authEndpoint(), [
                'client_id' => $clientId,
                'client_secret' => $clientSecret,
                'audience' => $this->audience(),
            ]);

            if (! $response->successful()) {
                Log::channel('nave')->error('Nave: error al obtener token.', [
                    'status' => $response->status(),
                    'response' => $response->body(),
                ]);

                return null;
            }

            return $response->json('access_token');
        });
    }

    /**
     * Crea una intención de pago en Nave.
     *
     * @param  array{
     *   external_payment_id: string,
     *   amount: float|int,
     *   products: array,
     *   buyer?: array,
     *   callback_url?: string,
     *   duration_time?: int
     * }  $params
     * @return array{id: string, checkout_url: string, qr_data: string, external_payment_id: string}|null
     */
    public function createPaymentIntent(array $params): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $posId = $this->posId();
        if (! $posId) {
            Log::channel('nave')->error('Nave: pos_id no configurado.');

            return null;
        }

        $amountStr = number_format((float) $params['amount'], 2, '.', '');

        $products = array_map(function (array $p): array {
            return [
                'name' => $p['name'],
                'description' => $p['description'] ?? $p['name'],
                'quantity' => (int) $p['quantity'],
                'unit_price' => [
                    'currency' => 'ARS',
                    'value' => number_format((float) $p['unit_price'], 2, '.', ''),
                ],
            ];
        }, $params['products']);

        $body = [
            'external_payment_id' => substr($params['external_payment_id'], 0, 36),
            'seller' => ['pos_id' => $posId],
            'transactions' => [
                [
                    'amount' => ['currency' => 'ARS', 'value' => $amountStr],
                    'products' => $products,
                ],
            ],
            'additional_info' => [],
        ];

        if (! empty($params['callback_url'])) {
            $body['additional_info']['callback_url'] = $params['callback_url'];
        }

        if (! empty($params['buyer'])) {
            $body['buyer'] = $params['buyer'];
        }

        if (! empty($params['duration_time'])) {
            $body['duration_time'] = (int) $params['duration_time'];
        }

        Log::channel('nave')->info('Nave: creando intención de pago.', [
            'external_payment_id' => $body['external_payment_id'],
            'amount' => $amountStr,
        ]);

        $response = Http::withToken($token)
            ->post($this->apiBase().'/api/payment_request/ecommerce', $body);

        if (! $response->successful()) {
            Log::channel('nave')->error('Nave: error al crear intención de pago.', [
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return null;
        }

        return $response->json();
    }

    /**
     * Consulta el estado de un pago por payment_id.
     */
    public function getPayment(string $paymentId): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $response = Http::withToken($token)
            ->get($this->apiBase().'/ranty-payments/payments/'.$paymentId);

        if (! $response->successful()) {
            Log::channel('nave')->error('Nave: error al consultar pago.', [
                'payment_id' => $paymentId,
                'status' => $response->status(),
            ]);

            return null;
        }

        return $response->json();
    }

    /**
     * Consulta una intención de pago por payment_request_id.
     */
    public function getPaymentRequest(string $paymentRequestId): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $response = Http::withToken($token)
            ->get($this->apiBase().'/api/payment_requests/'.$paymentRequestId);

        if (! $response->successful()) {
            return null;
        }

        return $response->json();
    }

    /**
     * Cancela una intención de pago activa.
     */
    public function cancelPaymentRequest(string $paymentRequestId): bool
    {
        $token = $this->accessToken();
        if (! $token) {
            return false;
        }

        $response = Http::withToken($token)
            ->delete($this->apiBase().'/api/payment_requests/'.$paymentRequestId);

        return $response->successful();
    }
}
