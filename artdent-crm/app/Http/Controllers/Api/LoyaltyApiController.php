<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LoyaltyReward;
use App\Models\LoyaltySetting;
use App\Services\LoyaltyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoyaltyApiController extends Controller
{
    public function show(Request $request, LoyaltyService $loyalty): JsonResponse
    {
        $customer = $request->user('customer');
        $settings = LoyaltySetting::forCompany($customer->company_id);

        $rewards = $settings->is_enabled
            ? LoyaltyReward::where('company_id', $customer->company_id)
                ->where('is_active', true)
                ->orderBy('points_cost')
                ->get(['id', 'name', 'points_cost', 'discount_amount'])
            : [];

        return response()->json([
            'enabled' => $settings->is_enabled,
            'balance' => $settings->is_enabled ? $loyalty->balanceFor($customer) : 0,
            'accrual_percentage' => $settings->accrual_percentage,
            'max_redemption_percentage' => $settings->max_redemption_percentage,
            'rewards' => $rewards,
        ]);
    }
}
