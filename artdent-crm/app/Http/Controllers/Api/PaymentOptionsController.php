<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EcommercePaymentConfig;
use App\Models\ShippingPickupPoint;
use Illuminate\Http\JsonResponse;

class PaymentOptionsController extends Controller
{
    /**
     * Return all enabled payment methods for the e-commerce checkout.
     * MercadoPago: exposes public_key only (never access_token).
     * Cash: includes pickup points that accept cash.
     */
    public function index(): JsonResponse
    {
        $configs = EcommercePaymentConfig::query()
            ->where('is_enabled', true)
            ->orderBy('sort_order')
            ->get();

        $result = $configs->map(function (EcommercePaymentConfig $config): array {
            $item = [
                'type' => $config->type,
                'label' => $config->label,
                'instructions' => $config->instructions,
            ];

            if ($config->type === 'mercadopago') {
                $item['public_key'] = $config->config['public_key'] ?? null;
            } elseif ($config->type === 'bank_transfer') {
                $item['cbu'] = $config->config['cbu'] ?? null;
                $item['alias'] = $config->config['alias'] ?? null;
                $item['account_name'] = $config->config['account_name'] ?? null;
            } elseif ($config->type === 'qr') {
                $item['image_url'] = $config->config['image_url'] ?? null;
                $item['payment_url'] = $config->config['payment_url'] ?? null;
            } elseif ($config->type === 'cash') {
                $item['pickup_points'] = ShippingPickupPoint::query()
                    ->where('is_active', true)
                    ->where('accepts_cash_payment', true)
                    ->orderBy('name')
                    ->get(['id', 'name', 'address', 'city', 'province', 'schedule', 'phone'])
                    ->toArray();
            }

            return $item;
        });

        return response()->json($result);
    }
}
