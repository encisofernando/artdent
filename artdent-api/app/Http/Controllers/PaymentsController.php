<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\PaymentTransaction;
use App\Services\MercadoPagoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentsController extends Controller
{
    protected MercadoPagoService $mercadoPago;

    public function __construct(MercadoPagoService $mercadoPago)
    {
        $this->mercadoPago = $mercadoPago;
    }

    /**
     * POST /api/orders/{order}/payment/create
     * Create payment preference
     */
    public function createPayment(Request $request, EcommerceOrder $order)
    {
        // Verify order belongs to user or has valid code
        $user = $request->user();
        if ($user && $order->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        // Check if order is already paid
        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'El pedido ya está pago'], 422);
        }

        $data = $request->validate([
            'payment_method' => 'required|in:mercadopago,stripe,transfer',
            'success_url' => 'nullable|url',
            'failure_url' => 'nullable|url',
        ]);

        try {
            if ($data['payment_method'] === 'mercadopago') {
                $preference = $this->mercadoPago->createPreference($order, [
                    'success_url' => $data['success_url'] ?? null,
                    'failure_url' => $data['failure_url'] ?? null,
                ]);

                return response()->json([
                    'payment_method' => 'mercadopago',
                    'preference_id' => $preference['preference_id'],
                    'init_point' => $preference['init_point'],
                    'public_key' => config('services.mercadopago.public_key'),
                ]);
            }

            // TODO: Add other payment methods (Stripe, etc)

            return response()->json(['message' => 'Método de pago no implementado'], 501);
        } catch (\Exception $e) {
            Log::error('Payment creation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al crear el pago: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/orders/{order}/payment/status
     */
    public function getPaymentStatus(Request $request, EcommerceOrder $order)
    {
        $user = $request->user();
        if ($user && $order->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $transactions = PaymentTransaction::where('order_id', $order->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'paid_at' => $order->paid_at,
            'transactions' => $transactions,
        ]);
    }

    /**
     * POST /api/webhooks/mercadopago
     * Handle MercadoPago webhook
     */
    public function mercadoPagoWebhook(Request $request)
    {
        Log::info('MercadoPago webhook received', $request->all());

        try {
            $this->mercadoPago->processWebhook($request->all());
            return response()->json(['status' => 'ok']);
        } catch (\Exception $e) {
            Log::error('MercadoPago webhook processing failed', [
                'error' => $e->getMessage(),
                'data' => $request->all(),
            ]);

            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * POST /api/orders/{order}/payment/refund (Admin)
     */
    public function refund(Request $request, EcommerceOrder $order)
    {
        $data = $request->validate([
            'amount' => 'nullable|numeric|min:0',
            'reason' => 'nullable|string|max:500',
        ]);

        $transaction = PaymentTransaction::where('order_id', $order->id)
            ->where('status', 'approved')
            ->latest()
            ->first();

        if (!$transaction) {
            return response()->json(['message' => 'No hay transacción aprobada para reembolsar'], 422);
        }

        try {
            if ($transaction->gateway === 'mercadopago') {
                $refund = $this->mercadoPago->refund(
                    $transaction->transaction_id,
                    $data['amount'] ?? null
                );

                $order->update([
                    'payment_status' => 'refunded',
                    'current_status' => 'refunded',
                ]);

                return response()->json([
                    'message' => 'Reembolso procesado exitosamente',
                    'refund' => $refund,
                ]);
            }

            return response()->json(['message' => 'Gateway no soportado para reembolsos'], 501);
        } catch (\Exception $e) {
            Log::error('Refund failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error al procesar el reembolso: ' . $e->getMessage(),
            ], 500);
        }
    }
}
