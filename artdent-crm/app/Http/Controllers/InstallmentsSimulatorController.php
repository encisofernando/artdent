<?php

namespace App\Http\Controllers;

use App\Models\NaveInstallmentRate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Cotizador de cuotas Nave para el equipo de Ventas — solo lectura. La
 * edición de la tabla de tasas vive aparte, en Sistema → Administración
 * (NaveInstallmentRateSettingsController), gateada por settings.edit.
 */
class InstallmentsSimulatorController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('InstallmentsSimulator/Index', [
            'rates' => NaveInstallmentRate::query()
                ->where('is_active', true)
                ->orderBy('bank')
                ->orderBy('card_brand')
                ->orderBy('card_type')
                ->orderBy('sort_order')
                ->get(['bank', 'card_brand', 'card_type', 'installments', 'rate_pct', 'tier_label']),
        ]);
    }
}
