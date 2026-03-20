<?php

namespace App\Http\Controllers;

use App\Models\EcommercePaymentConfig;
use App\Models\ShippingPickupPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EcommercePaymentConfigController extends Controller
{
    public function index(): Response
    {
        $configs = EcommercePaymentConfig::orderBy('sort_order')->get();

        $pickupPoints = ShippingPickupPoint::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'city', 'accepts_cash_payment']);

        return Inertia::render('EcommercePayment/Index', [
            'configs' => $configs,
            'pickupPoints' => $pickupPoints,
        ]);
    }

    public function update(Request $request, string $type): JsonResponse
    {
        $config = EcommercePaymentConfig::where('type', $type)->firstOrFail();

        $validated = $request->validate([
            'is_enabled' => ['required', 'boolean'],
            'label' => ['sometimes', 'required', 'string', 'max:100'],
            'instructions' => ['nullable', 'string', 'max:2000'],
            'config' => ['nullable', 'array'],
            // MP
            'config.access_token' => ['nullable', 'string', 'max:255'],
            'config.public_key' => ['nullable', 'string', 'max:255'],
            'config.webhook_secret' => ['nullable', 'string', 'max:255'],
            // Transfer
            'config.cbu' => ['nullable', 'string', 'max:50'],
            'config.alias' => ['nullable', 'string', 'max:50'],
            'config.account_name' => ['nullable', 'string', 'max:150'],
            // QR
            'config.image_url' => ['nullable', 'url', 'max:500'],
            'config.payment_url' => ['nullable', 'url', 'max:500'],
        ]);

        $config->update($validated);

        // Return config with secret keys masked
        $data = $config->fresh()->toArray();
        if ($type === 'mercadopago') {
            if (! empty($data['config']['access_token'])) {
                $data['config']['access_token'] = '••••••••'.substr($data['config']['access_token'], -6);
            }
            if (! empty($data['config']['webhook_secret'])) {
                $data['config']['webhook_secret'] = '••••••••'.substr($data['config']['webhook_secret'], -6);
            }
        }

        return response()->json($data);
    }
}
