<?php

namespace App\Http\Controllers;

use App\Models\PhaseTemplate;
use App\Services\TariffPricingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PhaseTemplateController extends Controller
{
    public function __construct(private readonly TariffPricingService $pricingService) {}

    public function index(Request $request): Response
    {
        $companyId = auth()->user()->company_id;

        $items = PhaseTemplate::where('company_id', $companyId)
            ->withCount('tariffPhases')
            ->orderBy('name')
            ->get();

        return Inertia::render('PhaseTemplate/Index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('phase_templates')->where('company_id', $companyId)],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ], [
            'name.unique' => 'Ya existe una fase con ese nombre en el catálogo.',
        ]);

        PhaseTemplate::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'price' => $validated['price'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('phase-templates.index')->with('success', 'Fase creada en el catálogo.');
    }

    public function update(Request $request, PhaseTemplate $phaseTemplate): RedirectResponse
    {
        abort_if($phaseTemplate->company_id !== auth()->user()->company_id, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('phase_templates')->where('company_id', $phaseTemplate->company_id)->ignore($phaseTemplate->id)],
            'price' => ['required', 'numeric', 'min:0'],
            'is_active' => ['boolean'],
        ], [
            'name.unique' => 'Ya existe una fase con ese nombre en el catálogo.',
        ]);

        $phaseTemplate->update($validated);

        // Propaga el nuevo nombre/precio a todos los aranceles que usan esta fase.
        $this->pricingService->applyTemplateChange($phaseTemplate);

        return redirect()->route('phase-templates.index')->with('success', 'Fase actualizada. Se recalcularon los aranceles que la usan.');
    }

    public function destroy(PhaseTemplate $phaseTemplate): RedirectResponse
    {
        abort_if($phaseTemplate->company_id !== auth()->user()->company_id, 404);

        if ($phaseTemplate->tariffPhases()->exists()) {
            return back()->with('error', 'No se puede eliminar: hay aranceles usando esta fase. Desactivala en su lugar.');
        }

        $phaseTemplate->delete();

        return redirect()->route('phase-templates.index')->with('success', 'Fase eliminada del catálogo.');
    }
}
