<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\EcommercePaymentConfig;
use App\Models\ShippingSetting;
use Illuminate\Http\JsonResponse;

class PublicConfigController extends Controller
{
    public function index(): JsonResponse
    {
        $company = Company::first();

        $mp = EcommercePaymentConfig::where('type', 'mercadopago')->first();
        $mpConfig = $mp?->config ?? [];
        $mpEnabled = $mp?->is_enabled ?? false;

        $shippingSettings = $company ? ShippingSetting::forCompany($company->id) : null;

        return response()->json([
            'company' => [
                'name' => $company?->name,
                'fantasy_name' => $company?->fantasy_name,
                'logo_url' => $company?->logo_url ? url($company->logo_url) : null,
                'email' => $company?->email,
                'phone' => $company?->phone,
                'whatsapp' => $company?->whatsapp_contact_number,
                'address' => $company?->address,
                'city' => $company?->city,
                'province' => $company?->province,
                'country' => $company?->country,
                'website' => $company?->website,
            ],
            'analytics' => [
                'ga4_id' => $company?->ga4_measurement_id,
                'meta_pixel_id' => $company?->meta_pixel_id,
                'hotjar_id' => $company?->hotjar_id,
                'gtm_id' => $company?->google_tag_manager_id,
            ],
            'payment' => [
                'mp_enabled' => $mpEnabled,
                'mp_public_key' => $mpEnabled ? ($mpConfig['public_key'] ?? null) : null,
                'mp_sandbox' => isset($mpConfig['sandbox_mode']) && $mpConfig['sandbox_mode'],
            ],
            'shipping' => [
                'free_shipping_enabled' => $shippingSettings?->free_shipping_enabled ?? false,
                'free_shipping_minimum_amount' => $shippingSettings?->free_shipping_minimum_amount,
            ],
        ])->withHeaders([
            'Cache-Control' => 'public, max-age=300',
        ]);
    }
}
