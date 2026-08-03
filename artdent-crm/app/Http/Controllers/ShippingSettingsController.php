<?php

namespace App\Http\Controllers;

use App\Models\ShippingSetting;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Configuración de envío gratis (Sistema → Administración) — una fila por
 * empresa (CompanyContext::id()), mismo criterio que LoyaltySettingsController.
 */
class ShippingSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/Shipping/Index', [
            'settings' => ShippingSetting::forCompany(CompanyContext::id()),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'free_shipping_enabled' => ['required', 'boolean'],
            'free_shipping_minimum_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        ShippingSetting::forCompany(CompanyContext::id())->update($validated);

        return back()->with('success', 'Configuración de envío gratis actualizada.');
    }
}
