<?php

namespace App\Http\Controllers;

use App\Services\MercadoPagoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(private readonly MercadoPagoService $mpService) {}

    /**
     * Recibe eventos de MercadoPago (preapproval — suscripciones).
     * No requiere autenticación — ruta excluida del CSRF.
     */
    public function mercadopago(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('MP Webhook recibido', ['payload' => $payload]);

        try {
            $this->mpService->processWebhook($payload);
        } catch (\Throwable $e) {
            Log::error('MP Webhook error', ['error' => $e->getMessage(), 'payload' => $payload]);

            return response()->json(['error' => 'Internal error'], 500);
        }

        // MP espera un 200 rápido — cualquier otro código reintenta el envío
        return response()->json(['status' => 'ok']);
    }
}
