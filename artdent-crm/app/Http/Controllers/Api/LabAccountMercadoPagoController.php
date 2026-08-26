<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ResolvesCurrentDentist;
use App\Http\Controllers\Controller;
use App\Models\EcommercePaymentConfig;
use App\Models\LabAccount;
use App\Models\LabAccountMpPayment;
use App\Services\LabAccountPaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Checkout Pro de Mercado Pago para que el odontólogo pague su saldo de
 * cuenta corriente desde el portal — paralelo a Api\PaymentController (el
 * checkout de e-commerce), no lo reusa: acá no hay stock/AFIP/loyalty, y el
 * "pedido" es un LabAccountMpPayment en vez de un EcommerceOrder.
 */
class LabAccountMercadoPagoController extends Controller
{
    use ResolvesCurrentDentist;

    private function accessToken(): string
    {
        $config = EcommercePaymentConfig::where('type', 'mercadopago')->first();
        $token = $config?->configValue('access_token');

        return $token ?: config('services.mercadopago.access_token', '');
    }

    private function webhookSecret(): string
    {
        $config = EcommercePaymentConfig::where('type', 'mercadopago')->first();
        $secret = $config?->configValue('webhook_secret');

        return $secret ?: config('services.mercadopago.webhook_secret', '');
    }

    public function createPreference(Request $request): JsonResponse
    {
        $dentist = $this->currentDentist($request);
        $account = LabAccount::firstOrCreate(['dentist_id' => $dentist->id], ['balance' => 0]);

        if ($account->balance <= 0) {
            return response()->json(['message' => 'No tenés saldo pendiente para pagar.'], 422);
        }

        $amount = (float) $account->balance;
        $externalReference = 'labaccount-mp-'.$dentist->id.'-'.Str::random(12);

        $payment = LabAccountMpPayment::create([
            'dentist_id' => $dentist->id,
            'lab_account_id' => $account->id,
            'amount' => $amount,
            'external_reference' => $externalReference,
            'status' => LabAccountMpPayment::STATUS_PENDING,
        ]);

        $portalUrl = rtrim(config('app.url'), '/');
        $apiUrl = rtrim(config('app.url'), '/');

        $payload = [
            'items' => [[
                'id' => 'labaccount-'.$dentist->id,
                'title' => 'Pago cuenta corriente — '.$dentist->name,
                'quantity' => 1,
                'unit_price' => $amount,
                'currency_id' => 'ARS',
            ]],
            'external_reference' => $externalReference,
            'back_urls' => [
                'success' => "{$portalUrl}/account/checkout?mp=success",
                'failure' => "{$portalUrl}/account/checkout?mp=failure",
                'pending' => "{$portalUrl}/account/checkout?mp=pending",
            ],
            'notification_url' => "{$apiUrl}/api/payment/mp/lab-account/webhook",
            'binary_mode' => true,
            'expires' => true,
            'expiration_date_to' => now()->addHours(24)->toIso8601String(),
        ];

        if (! str_contains($portalUrl, 'localhost') && ! str_contains($portalUrl, '127.0.0.1')) {
            $payload['auto_return'] = 'approved';
        }

        $response = Http::withToken($this->accessToken())
            ->when(! app()->isProduction(), fn ($h) => $h->withoutVerifying())
            ->post('https://api.mercadopago.com/checkout/preferences', $payload);

        if (! $response->successful()) {
            Log::channel('mercadopago')->error('LabAccount MP: error al crear preferencia.', [
                'dentist_id' => $dentist->id,
                'status' => $response->status(),
                'response' => $response->json(),
            ]);

            $payment->update(['status' => LabAccountMpPayment::STATUS_REJECTED]);

            return response()->json(['message' => 'No se pudo crear la preferencia de pago.'], 502);
        }

        $data = $response->json();

        return response()->json([
            'init_point' => $data['init_point'],
            'sandbox_init_point' => $data['sandbox_init_point'] ?? null,
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
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
                if (str_starts_with($part, 'ts=')) {
                    $ts = substr($part, 3);
                }
                if (str_starts_with($part, 'v1=')) {
                    $v1 = substr($part, 3);
                }
            }

            if ($ts && $v1) {
                $manifest = "id:{$dataId};request-id:{$requestId};ts:{$ts};";
                $hmac = hash_hmac('sha256', $manifest, $webhookSecret);
                if (! hash_equals($hmac, $v1)) {
                    Log::channel('mercadopago')->warning('LabAccount MP: firma inválida en webhook.', ['request_id' => $requestId]);

                    return response()->json(['message' => 'Invalid signature'], 403);
                }
            }
        }

        $mpPayment = Http::withToken($this->accessToken())
            ->when(! app()->isProduction(), fn ($h) => $h->withoutVerifying())
            ->get("https://api.mercadopago.com/v1/payments/{$dataId}")
            ->json();

        $externalRef = $mpPayment['external_reference'] ?? null;
        $mpStatus = $mpPayment['status'] ?? null;

        if (! $externalRef || ! str_starts_with($externalRef, 'labaccount-mp-')) {
            return response()->json(['ok' => true]);
        }

        try {
            DB::transaction(function () use ($externalRef, $mpStatus, $dataId) {
                $payment = LabAccountMpPayment::where('external_reference', $externalRef)
                    ->lockForUpdate()
                    ->first();

                if (! $payment || $payment->status !== LabAccountMpPayment::STATUS_PENDING) {
                    return;
                }

                if ($mpStatus === 'approved') {
                    $move = app(LabAccountPaymentService::class)->registerPayment(
                        dentist: $payment->dentist,
                        amount: $payment->amount,
                        paymentMethodId: null,
                        description: 'Pago con Mercado Pago desde el portal del odontólogo',
                    );

                    $payment->update([
                        'status' => LabAccountMpPayment::STATUS_APPROVED,
                        'mp_payment_id' => (string) $dataId,
                        'lab_account_move_id' => $move->id,
                    ]);
                } elseif (in_array($mpStatus, ['rejected', 'cancelled'], true)) {
                    $payment->update([
                        'status' => LabAccountMpPayment::STATUS_REJECTED,
                        'mp_payment_id' => (string) $dataId,
                    ]);
                }
            });
        } catch (\Throwable $e) {
            Log::channel('mercadopago')->error('LabAccount MP: error al procesar webhook.', [
                'external_reference' => $externalRef,
                'error' => $e->getMessage(),
            ]);

            return response()->json(['message' => 'Internal error'], 500);
        }

        return response()->json(['ok' => true]);
    }
}
