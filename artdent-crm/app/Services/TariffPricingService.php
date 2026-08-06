<?php

namespace App\Services;

use App\Models\PhaseTemplate;
use App\Models\TariffPhase;

/**
 * Propaga el precio del catálogo de fases a todos los aranceles que usan cada fase, así
 * el precio de una fase se edita en un solo lugar (el catálogo) en vez de arancel por
 * arancel.
 *
 * El precio del arancel (`Tariff.price`, "Datos del Trabajo") es siempre manual — nunca
 * se recalcula a partir de la suma de fases. Las fases sólo definen cuánto se le cobra
 * al odontólogo progresivamente por cada etapa (ver JobPhaseService::billPhaseIfNeeded,
 * que ajusta la última fase contra el precio real del arancel), no el precio final del
 * trabajo.
 */
class TariffPricingService
{
    /**
     * Cuando se edita el nombre/precio de una fase del catálogo, propaga el cambio a
     * todas las `TariffPhase` que la usan.
     */
    public function applyTemplateChange(PhaseTemplate $template): void
    {
        TariffPhase::where('phase_template_id', $template->id)
            ->get()
            ->each(fn (TariffPhase $phase) => $phase->update([
                'name' => $template->name,
                'price' => $template->price,
            ]));
    }
}
