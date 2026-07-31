<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NaveInstallmentRate;
use Illuminate\Http\JsonResponse;

class NaveInstallmentRateApiController extends Controller
{
    /**
     * Tasas de cuotas Nave activas, para el widget público de e-commerce
     * ("Ver cuotas"). Sólo expone lo necesario para calcular: banco, marca,
     * tipo, cantidad de cuotas y tasa.
     */
    public function index(): JsonResponse
    {
        $rates = NaveInstallmentRate::query()
            ->where('is_active', true)
            ->orderBy('bank')
            ->orderBy('card_brand')
            ->orderBy('card_type')
            ->orderBy('sort_order')
            ->get(['bank', 'card_brand', 'card_type', 'installments', 'rate_pct', 'tier_label']);

        return response()->json($rates);
    }
}
