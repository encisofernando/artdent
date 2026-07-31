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

    // Endpoint real usado por el plugin oficial de Nave para WooCommerce para
    // consultar el estado de un payment — distinto del que documenta la guía
    // de integración (api-sandbox.ranty.io/ranty-payments/payments/:id, que
    // sigue usando getPayment() más abajo sin tocar por no romper el checkout
    // online ya en producción). getPaymentInternal() lo usa el flujo nuevo de
    // cobro presencial (QR/link) porque es el que confirmó ser el actual.
    private const PAYMENTS_SANDBOX = 'https://punku-sandbox.ranty.io/payments-ms/payments';

    private const PAYMENTS_PROD = 'https://punku.ranty.io/payments-ms/payments';

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
     * POS ID del QR físico presencial — se da de alta aparte en Nave (Negocios
     * > Agregar medios de cobro > QR), es distinto del pos_id de checkout online.
     */
    public function posIdQr(): ?string
    {
        return $this->config()['pos_id_qr'] ?? null;
    }

    private function paymentsBase(): string
    {
        return $this->isSandbox() ? self::PAYMENTS_SANDBOX : self::PAYMENTS_PROD;
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
        $posId = $this->posId();
        if (! $posId) {
            Log::channel('nave')->error('Nave: pos_id no configurado.');

            return null;
        }

        $body = $this->baseIntentBody($params, $posId);

        if (! empty($params['callback_url'])) {
            $body['additional_info']['callback_url'] = $params['callback_url'];
        }

        return $this->postPaymentRequest('/api/payment_request/ecommerce', $body);
    }

    /**
     * Crea un link de pago (para mandar por WhatsApp/email/SMS) — mismo body
     * y respuesta que createPaymentIntent(), solo cambia el endpoint. Se usa
     * para cobros remotos (ej. saldar una cuenta corriente sin que el cliente
     * esté presente).
     *
     * @param  array{
     *   external_payment_id: string,
     *   amount: float|int,
     *   products: array,
     *   buyer?: array,
     *   notification_url?: string,
     *   duration_time?: int
     * }  $params
     * @return array{id: string, checkout_url: string, qr_data: string}|null
     */
    public function createPaymentLinkIntent(array $params): ?array
    {
        $posId = $this->posId();
        if (! $posId) {
            Log::channel('nave')->error('Nave: pos_id no configurado.');

            return null;
        }

        $body = $this->baseIntentBody($params, $posId);

        return $this->postPaymentRequest('/api/payment_request/payment_link', $body);
    }

    /**
     * Crea una intención de pago con QR físico presencial (POS/cuenta
     * corriente). A diferencia de ecommerce/payment_link, la respuesta de
     * creación no trae qr_data (confirmado en la documentación de Nave) —
     * hay que consultar la intención recién creada para conseguirlo.
     *
     * @param  array{
     *   external_payment_id: string,
     *   amount: float|int,
     *   products: array,
     *   notification_url?: string,
     *   duration_time?: int
     * }  $params
     * @return array{id: string, qr_data: string|null}|null
     */
    public function createStaticQrIntent(array $params): ?array
    {
        $posId = $this->posIdQr();
        if (! $posId) {
            Log::channel('nave')->error('Nave: pos_id_qr no configurado.');

            return null;
        }

        $amountStr = number_format((float) $params['amount'], 2, '.', '');

        $body = [
            'external_payment_id' => substr($params['external_payment_id'], 0, 36),
            'seller' => ['pos_id' => $posId],
            'transactions' => [
                [
                    'qr_amount' => 'close',
                    'amount' => ['currency' => 'ARS', 'value' => $amountStr],
                    'products' => $this->buildProducts($params['products']),
                ],
            ],
        ];

        if (! empty($params['notification_url'])) {
            $body['additional_info'] = ['notification_url' => $params['notification_url']];
        }

        if (! empty($params['duration_time'])) {
            $body['duration_time'] = (int) $params['duration_time'];
        }

        $created = $this->postPaymentRequest('/api/payment_request/static_qr', $body);

        if (! $created || empty($created['id'])) {
            return null;
        }

        $full = $this->getPaymentRequest($created['id']);

        return [
            'id' => $created['id'],
            'qr_data' => $full['capture_data']['qr_data'] ?? null,
        ];
    }

    /**
     * Body común a createPaymentIntent()/createPaymentLinkIntent() — mismo
     * shape en ambos productos, solo cambia el endpoint de destino.
     */
    private function baseIntentBody(array $params, string $posId): array
    {
        $amountStr = number_format((float) $params['amount'], 2, '.', '');

        $body = [
            'external_payment_id' => substr($params['external_payment_id'], 0, 36),
            'seller' => ['pos_id' => $posId],
            'transactions' => [
                [
                    'amount' => ['currency' => 'ARS', 'value' => $amountStr],
                    'products' => $this->buildProducts($params['products']),
                ],
            ],
            'additional_info' => [],
        ];

        if (! empty($params['notification_url'])) {
            $body['additional_info']['notification_url'] = $params['notification_url'];
        }

        if (! empty($params['buyer'])) {
            $body['buyer'] = $params['buyer'];
        }

        if (! empty($params['duration_time'])) {
            $body['duration_time'] = (int) $params['duration_time'];
        }

        // Un array PHP vacío se serializa como "[]" (array JSON) en vez de
        // "{}" (objeto JSON) — Nave rechaza additional_info como array
        // ("Expected object, received array additional_info"), confirmado
        // contra la API real. Si quedó vacío, forzar a objeto.
        if (empty($body['additional_info'])) {
            $body['additional_info'] = (object) [];
        }

        return $body;
    }

    private function buildProducts(array $products): array
    {
        return array_map(function (array $p): array {
            return [
                'name' => $p['name'],
                'description' => $p['description'] ?? $p['name'],
                'quantity' => (int) $p['quantity'],
                'unit_price' => [
                    'currency' => 'ARS',
                    'value' => number_format((float) $p['unit_price'], 2, '.', ''),
                ],
            ];
        }, $products);
    }

    private function postPaymentRequest(string $endpoint, array $body): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        Log::channel('nave')->info('Nave: creando intención de pago.', [
            'endpoint' => $endpoint,
            'external_payment_id' => $body['external_payment_id'] ?? null,
        ]);

        $response = Http::withToken($token)->post($this->apiBase().$endpoint, $body);

        if (! $response->successful()) {
            Log::channel('nave')->error('Nave: error al crear intención de pago.', [
                'endpoint' => $endpoint,
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
     * Consulta el estado de un pago por payment_id, usando el endpoint que
     * usa el plugin oficial de Nave para WooCommerce (dominio punku.ranty.io
     * + /internal) — confirmado más reciente que el de getPayment() de
     * arriba, que sigue documentado en la guía de integración pero que el
     * plugin ya no usa. Se agrega aparte en vez de reemplazar getPayment()
     * para no tocar el webhook de checkout online ya en producción; la usa
     * el webhook nuevo de cobro presencial (QR/link).
     */
    public function getPaymentInternal(string $paymentId): ?array
    {
        $token = $this->accessToken();
        if (! $token) {
            return null;
        }

        $response = Http::withToken($token)
            ->get($this->paymentsBase().'/'.$paymentId.'/internal');

        if (! $response->successful()) {
            Log::channel('nave')->error('Nave: error al consultar pago (internal).', [
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
