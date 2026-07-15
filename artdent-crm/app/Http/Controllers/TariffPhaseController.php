<?php

namespace App\Http\Controllers;

use App\Models\PhaseTemplate;
use App\Models\Tariff;
use App\Models\TariffPhase;
use App\Services\TariffPricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TariffPhaseController extends Controller
{
    public function __construct(private readonly TariffPricingService $pricingService) {}

    public function index(Tariff $tariff)
    {
        return response()->json($tariff->phases);
    }

    /**
     * Asigna una fase del catálogo a este arancel. El nombre y precio se copian del
     * catálogo en este momento; si el catálogo cambia después, se vuelven a sincronizar
     * automáticamente (ver PhaseTemplateController::update).
     */
    public function store(Request $request, Tariff $tariff): RedirectResponse
    {
        $data = $request->validate([
            'phase_template_id' => [
                'required', 'integer',
                Rule::exists('phase_templates', 'id')->where('company_id', $tariff->company_id),
            ],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $template = PhaseTemplate::findOrFail($data['phase_template_id']);

        if (! isset($data['sort_order'])) {
            $data['sort_order'] = $tariff->phases()->max('sort_order') + 1;
        }

        $tariff->phases()->create([
            'phase_template_id' => $template->id,
            'name' => $template->name,
            'price' => $template->price,
            'sort_order' => $data['sort_order'],
        ]);

        $this->pricingService->syncPriceFromPhases($tariff);

        return back()->with('success', 'Fase agregada.');
    }

    public function update(Request $request, Tariff $tariff, TariffPhase $phase): RedirectResponse
    {
        abort_if($phase->tariff_id !== $tariff->id, 403);

        $data = $request->validate([
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ]);

        $phase->update($data);

        return back()->with('success', 'Fase actualizada.');
    }

    public function destroy(Tariff $tariff, TariffPhase $phase): RedirectResponse
    {
        abort_if($phase->tariff_id !== $tariff->id, 403);

        $phase->delete();

        $this->pricingService->syncPriceFromPhases($tariff);

        return back()->with('success', 'Fase eliminada.');
    }
}
