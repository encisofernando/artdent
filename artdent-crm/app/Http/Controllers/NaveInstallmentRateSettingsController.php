<?php

namespace App\Http\Controllers;

use App\Models\NaveInstallmentRate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Configuración administrativa de la tabla de tasas de cuotas Nave (Sistema
 * → Administración). Separado de InstallmentsSimulatorController, que es la
 * herramienta de cotización para el equipo de Ventas (solo lectura).
 */
class NaveInstallmentRateSettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Settings/NaveInstallmentRates/Index', [
            'rates' => NaveInstallmentRate::query()
                ->orderBy('bank')
                ->orderBy('card_brand')
                ->orderBy('card_type')
                ->orderBy('sort_order')
                ->get(),
        ]);
    }

    /**
     * Reemplazo completo de la tabla de tasas — se edita como un bloque único
     * desde la UI (agregar/quitar/editar filas), no CRUD fila por fila.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rates' => ['required', 'array'],
            'rates.*.bank' => ['required', 'string', 'in:galicia,naranja,otros_bancos'],
            'rates.*.card_brand' => ['required', 'string', 'max:20'],
            'rates.*.card_type' => ['required', 'string', 'in:credit,debit'],
            'rates.*.installments' => ['required', 'integer', 'min:1', 'max:60'],
            'rates.*.rate_pct' => ['required', 'numeric', 'min:0', 'max:500'],
            'rates.*.tier_label' => ['nullable', 'string', 'max:50'],
            'rates.*.is_active' => ['required', 'boolean'],
        ]);

        DB::transaction(function () use ($validated) {
            NaveInstallmentRate::query()->delete();

            $now = now();
            $rows = collect($validated['rates'])->values()->map(fn (array $r, int $i) => [
                'bank' => $r['bank'],
                'card_brand' => $r['card_brand'],
                'card_type' => $r['card_type'],
                'installments' => $r['installments'],
                'rate_pct' => $r['rate_pct'],
                'tier_label' => $r['tier_label'] ?? null,
                'is_active' => $r['is_active'],
                'sort_order' => $i,
                'created_at' => $now,
                'updated_at' => $now,
            ])->all();

            if (! empty($rows)) {
                NaveInstallmentRate::query()->insert($rows);
            }
        });

        return back()->with('success', 'Tasas actualizadas.');
    }
}
