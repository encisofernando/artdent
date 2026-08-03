<?php

namespace App\Http\Controllers;

use App\Models\LoyaltySetting;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Configuración de puntos de fidelización (Sistema → Administración) — una
 * fila por empresa (CompanyContext::id()), porque un tenant puede tener
 * varias empresas con reglas de acumulación distintas.
 */
class LoyaltySettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/Loyalty/Index', [
            'settings' => LoyaltySetting::forCompany(CompanyContext::id()),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'is_enabled' => ['required', 'boolean'],
            'accrual_percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'min_purchase_amount' => ['nullable', 'numeric', 'min:0'],
            'max_redemption_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        LoyaltySetting::forCompany(CompanyContext::id())->update($validated);

        return back()->with('success', 'Configuración de puntos actualizada.');
    }
}
