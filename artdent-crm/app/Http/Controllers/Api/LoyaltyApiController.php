<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltySetting;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyApiController extends Controller
{
    public function show(Request $request, LoyaltyService $loyalty): JsonResponse
    {
        $customer = $request->user();
        $settings = LoyaltySetting::forCompany($customer->company_id);

        return response()->json([
            'enabled' => $settings->is_enabled,
            'balance' => $settings->is_enabled ? $loyalty->balanceFor($customer) : 0.0,
            'accrual_percentage' => $settings->accrual_percentage,
            'max_redemption_percentage' => $settings->max_redemption_percentage,
        ]);
    }
}
