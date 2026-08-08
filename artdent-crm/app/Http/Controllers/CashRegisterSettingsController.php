<?php

namespace App\Http\Controllers;

use App\Models\CashRegisterSetting;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Configuración de Caja (Sistema → Administración) — una fila por empresa
 * (CompanyContext::id()), mismo criterio que LoyaltySettingsController.
 * Prender esto activa: exigir caja abierta para vender, y bloquear al
 * usuario si le quedó una sesión abierta de un día anterior (ver
 * EnsureCashSessionIsCurrent). Apagado, el sistema vende sin pedir caja.
 */
class CashRegisterSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/CashRegister/Index', [
            'settings' => CashRegisterSetting::forCompany(CompanyContext::id()),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'is_enabled' => ['required', 'boolean'],
        ]);

        CashRegisterSetting::forCompany(CompanyContext::id())->update($validated);

        return back()->with('success', 'Configuración de caja actualizada.');
    }
}
