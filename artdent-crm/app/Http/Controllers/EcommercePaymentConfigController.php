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
        $configs = EcommercePaymentConfig::orderBy('sort_order')
            ->get()
            ->map(fn (EcommercePaymentConfig $config) => $config->toMaskedArray());

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

        $existingConfig = is_array($config->config) ? $config->config : [];
        $incomingConfig = is_array($validated['config'] ?? null) ? $validated['config'] : [];

        if ($type === 'mercadopago') {
            foreach (['access_token', 'webhook_secret'] as $secretKey) {
                if (
                    array_key_exists($secretKey, $incomingConfig)
                    && EcommercePaymentConfig::isMaskedSecretValue($incomingConfig[$secretKey])
                ) {
                    $incomingConfig[$secretKey] = $existingConfig[$secretKey] ?? null;
                }
            }
        }

        $validated['config'] = array_merge($existingConfig, $incomingConfig);

        $config->update($validated);

        $data = $config->fresh()->toMaskedArray();

        return response()->json($data);
    }
}
