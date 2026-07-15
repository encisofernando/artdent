<?php

namespace App\Services;

use App\Models\PhaseTemplate;
use App\Models\Tariff;
use App\Models\TariffPhase;

/**
 * Mantiene sincronizado el precio de un arancel con la suma de sus fases (más el margen
 * de rentabilidad del arancel), y propaga el precio del catálogo de fases a todos los
 * aranceles que usan cada fase. Así el precio de una fase se edita en un solo lugar
 * (el catálogo) en vez de arancel por arancel.
 */
class TariffPricingService
{
    /**
     * Recalcula `Tariff.price` a partir de la suma de sus fases + margen. Si el arancel
     * no tiene fases asignadas, no toca el precio (sigue siendo manual o por fórmula de
     * costos, como antes de que existiera el catálogo de fases).
     */
    public function syncPriceFromPhases(Tariff $tariff): void
    {
        $tariff->loadMissing('phases');

        if ($tariff->phases->isEmpty()) {
            return;
        }

        $phasesTotal = (float) $tariff->phases->sum('price');
        $margin = (float) ($tariff->margin_pct ?? 0);

        $tariff->update(['price' => round($phasesTotal * (1 + $margin / 100), 2)]);
    }

    /**
     * Cuando se edita el nombre/precio de una fase del catálogo, propaga el cambio a
     * todas las `TariffPhase` que la usan y recalcula el precio de cada arancel afectado.
     */
    public function applyTemplateChange(PhaseTemplate $template): void
    {
        $phases = TariffPhase::where('phase_template_id', $template->id)->get();

        foreach ($phases as $phase) {
            $phase->update(['name' => $template->name, 'price' => $template->price]);
        }

        $tariffIds = $phases->pluck('tariff_id')->unique();

        foreach (Tariff::whereIn('id', $tariffIds)->get() as $tariff) {
            $this->syncPriceFromPhases($tariff);
        }
    }
}
