<?php

namespace App\Services;

use App\Models\AfipIssuerSetting;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\Tenant;
use App\Services\Afip\SubscriptionInvoiceService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MercadoPagoService
{
    private string $accessToken;

    private string $baseUrl = 'https://api.mercadopago.com';

    public function __construct()
    {
        $this->accessToken = config('mercadopago.access_token');
    }

    // ── Planes (Preapproval Plans) ────────────────────────────────────────────

    /**
     * Crea un plan de suscripción en MercadoPago y guarda el ID + URL de checkout.
     */
    public function createPlan(Plan $plan): Plan
    {
        $response = Http::withToken($this->accessToken)
            ->post("{$this->baseUrl}/preapproval_plan", [
                'reason' => $plan->name,
                'auto_recurring' => [
                    'frequency' => 1,
                    'frequency_type' => 'months',
                    'transaction_amount' => (float) $plan->price,
                    'currency_id' => 'ARS',
                    'free_trial' => [
                        'frequency' => $plan->trial_days,
                        'frequency_type' => 'days',
                    ],
                ],
                'payment_methods_allowed' => [
                    'payment_types' => [
                        ['id' => 'credit_card'],
                        ['id' => 'debit_card'],
                    ],
                ],
                'back_url' => config('app.url').'/subscriptions/callback',
            ]);

        if ($response->failed()) {
            Log::error('MP createPlan failed', ['body' => $response->body(), 'plan' => $plan->id]);
            throw new \RuntimeException('Error al crear plan en MercadoPago: '.$response->body());
        }

        $data = $response->json();

        $plan->update([
            'mp_plan_id' => $data['id'],
            'mp_init_point' => $data['init_point'],
        ]);

        return $plan->fresh();
    }

    /**
     * Actualiza el precio/nombre de un plan existente en MP.
     */
    public function updatePlan(Plan $plan): void
    {
        if (! $plan->mp_plan_id) {
            return;
        }

        $response = Http::withToken($this->accessToken)
            ->put("{$this->baseUrl}/preapproval_plan/{$plan->mp_plan_id}", [
                'reason' => $plan->name,
                'auto_recurring' => [
                    'transaction_amount' => (float) $plan->price,
                    'currency_id' => 'ARS',
                ],
            ]);

        if ($response->failed()) {
            Log::error('MP updatePlan failed', ['plan_id' => $plan->mp_plan_id, 'body' => $response->body()]);
        }
    }

    // ── Suscripciones (Preapproval) ───────────────────────────────────────────

    /**
     * Genera una URL de checkout para que el tenant suscriba.
     * El tenant va a esta URL, ingresa su tarjeta, y MP llama al webhook.
     */
    public function getCheckoutUrl(Tenant $tenant, Plan $plan): string
    {
        if (! $plan->mp_plan_id) {
            throw new \RuntimeException("El plan [{$plan->slug}] no tiene mp_plan_id. Publicalo primero.");
        }

        $response = Http::withToken($this->accessToken)
            ->post("{$this->baseUrl}/preapproval", [
                'preapproval_plan_id' => $plan->mp_plan_id,
                'reason' => "Suscripción {$plan->name} — {$tenant->name}",
                'payer_email' => $tenant->email,
                'external_reference' => $tenant->id, // slug del tenant — viene en el webhook
                'back_url' => config('app.url').'/subscriptions/callback?tenant='.$tenant->id,
                'notification_url' => config('mercadopago.webhook_url'),
            ]);

        if ($response->failed()) {
            Log::error('MP getCheckoutUrl failed', ['tenant' => $tenant->id, 'body' => $response->body()]);
            throw new \RuntimeException('Error al generar URL de pago: '.$response->body());
        }

        $data = $response->json();

        // Guardar preapproval_id y checkout_url en el tenant
        $tenant->update(['checkout_url' => $data['init_point']]);

        // Crear/actualizar registro de suscripción
        Subscription::updateOrCreate(
            ['mp_preapproval_id' => $data['id']],
            [
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'mp_preapproval_id' => $data['id'],
                'status' => 'pending',
                'amount' => $plan->price,
                'mp_data' => array_merge($data, [
                    'payer_email' => $tenant->email,
                    'currency_id' => 'ARS',
                ]),
            ]
        );

        return $data['init_point'];
    }

    /**
     * Obtiene el estado actual de una suscripción desde MP.
     */
    public function getSubscriptionStatus(string $preapprovalId): array
    {
        $response = Http::withToken($this->accessToken)
            ->get("{$this->baseUrl}/preapproval/{$preapprovalId}");

        if ($response->failed()) {
            Log::error('MP getSubscriptionStatus failed', ['preapproval_id' => $preapprovalId]);

            return [];
        }

        return $response->json();
    }

    /**
     * Cancela una suscripción en MP.
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        if (! $subscription->mp_preapproval_id) {
            return;
        }

        $response = Http::withToken($this->accessToken)
            ->put("{$this->baseUrl}/preapproval/{$subscription->mp_preapproval_id}", [
                'status' => 'cancelled',
            ]);

        if ($response->failed()) {
            Log::error('MP cancelSubscription failed', [
                'preapproval_id' => $subscription->mp_preapproval_id,
                'body' => $response->body(),
            ]);
        }
    }

    // ── Webhooks ──────────────────────────────────────────────────────────────

    /**
     * Procesa un evento de webhook de MercadoPago para suscripciones.
     * Actualiza el estado del tenant según el estado del preapproval.
     */
    public function processWebhook(array $payload): void
    {
        $type = $payload['type'] ?? null;

        if ($type === 'payment') {
            $this->processPaymentWebhook($payload);

            return;
        }

        if ($type !== 'preapproval') {
            Log::info('MP webhook ignorado — tipo no es preapproval ni payment', ['type' => $type]);

            return;
        }

        $preapprovalId = $payload['data']['id'] ?? null;

        if (! $preapprovalId) {
            return;
        }

        $mpData = $this->getSubscriptionStatus($preapprovalId);

        if (empty($mpData)) {
            return;
        }

        $tenantId = $mpData['external_reference'] ?? null;  // slug del tenant
        $status = $mpData['status'] ?? null;

        $subscription = Subscription::where('mp_preapproval_id', $preapprovalId)->first();

        if (! $subscription && $tenantId) {
            $subscription = Subscription::where('tenant_id', $tenantId)->latest()->first();
        }

        if (! $subscription) {
            Log::warning('MP webhook: suscripción no encontrada', ['preapproval_id' => $preapprovalId]);

            return;
        }

        // Mapear estado de MP → nuestro status
        $internalStatus = match ($status) {
            'authorized' => 'authorized',
            'paused' => 'paused',
            'cancelled' => 'cancelled',
            default => 'pending',
        };

        $subscription->update([
            'status' => $internalStatus,
            'mp_preapproval_id' => $preapprovalId,
            'next_payment_date' => isset($mpData['next_payment_date']) ? Carbon::parse($mpData['next_payment_date']) : null,
            'mp_data' => $mpData,
        ]);

        // Actualizar estado del tenant
        $tenant = $subscription->tenant;

        if ($tenant) {
            $tenantStatus = match ($internalStatus) {
                'authorized' => 'active',
                'paused' => 'suspended',
                'cancelled' => 'cancelled',
                default => $tenant->status,
            };

            $tenant->update([
                'status' => $tenantStatus,
                'activated_at' => $tenantStatus === 'active' && ! $tenant->activated_at ? now() : $tenant->activated_at,
            ]);

            Log::info("MP webhook: tenant [{$tenant->id}] → {$tenantStatus}", ['preapproval_id' => $preapprovalId]);
        }
    }

    /**
     * Obtiene el detalle de un pago individual (cargo de una suscripción).
     */
    public function getPaymentDetails(string $paymentId): array
    {
        $response = Http::withToken($this->accessToken)
            ->get("{$this->baseUrl}/v1/payments/{$paymentId}");

        if ($response->failed()) {
            Log::error('MP getPaymentDetails failed', ['payment_id' => $paymentId]);

            return [];
        }

        return $response->json();
    }

    /**
     * Procesa el webhook de un pago individual (cargo recurrente de una
     * suscripción ya autorizada) — dispara la factura AFIP de ArtCode al
     * tenant si `AfipIssuerSetting::auto_invoice` está activado. No bloquea
     * el 200 al webhook: cualquier error de AFIP queda logueado, MP no
     * reintenta por esto (la suscripción ya fue cobrada igual).
     */
    private function processPaymentWebhook(array $payload): void
    {
        $paymentId = $payload['data']['id'] ?? null;

        if (! $paymentId) {
            return;
        }

        $payment = $this->getPaymentDetails($paymentId);

        if (empty($payment) || ($payment['status'] ?? null) !== 'approved') {
            return;
        }

        $tenantId = $payment['external_reference'] ?? null;
        $subscription = $tenantId
            ? Subscription::where('tenant_id', $tenantId)->latest()->first()
            : null;

        if (! $subscription) {
            Log::warning('MP payment webhook: no se pudo resolver la suscripción/tenant', [
                'payment_id' => $paymentId,
                'external_reference' => $tenantId,
            ]);

            return;
        }

        $tenant = $subscription->tenant;

        if (! $tenant) {
            return;
        }

        $issuer = AfipIssuerSetting::current();

        if (! $issuer || ! $issuer->auto_invoice) {
            Log::info('MP payment webhook: auto-factura de suscripción deshabilitada, se omite', [
                'tenant_id' => $tenant->id,
            ]);

            return;
        }

        try {
            $amount = (float) ($payment['transaction_amount'] ?? $subscription->amount);
            $description = "Suscripción {$subscription->plan?->name} — ".now()->translatedFormat('F Y');

            app(SubscriptionInvoiceService::class)->generateForPayment(
                $tenant,
                $subscription,
                $amount,
                $description,
                (string) $paymentId,
            );
        } catch (\Throwable $e) {
            Log::error('MP payment webhook: error al facturar suscripción', [
                'tenant_id' => $tenant->id,
                'payment_id' => $paymentId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
