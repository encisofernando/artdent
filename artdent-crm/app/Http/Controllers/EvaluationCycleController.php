<?php

namespace App\Http\Controllers;

use App\Models\EvaluationCycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EvaluationCycleController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'type' => ['required', 'in:90,180,360,objectives'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'status' => ['required', 'in:draft,active,closed'],
        ]);

        EvaluationCycle::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Ciclo de evaluación creado.');
    }

    public function update(Request $request, EvaluationCycle $evaluationCycle): RedirectResponse
    {
        $this->ensureCompanyOwned($evaluationCycle, $request->user()->company_id ?? 1);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'type' => ['required', 'in:90,180,360,objectives'],
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'status' => ['required', 'in:draft,active,closed'],
        ]);

        $evaluationCycle->update($validated);

        return back()->with('success', 'Ciclo actualizado.');
    }

    public function destroy(Request $request, EvaluationCycle $evaluationCycle): RedirectResponse
    {
        $this->ensureCompanyOwned($evaluationCycle, $request->user()->company_id ?? 1);

        abort_if($evaluationCycle->evaluations()->exists(), 422, 'No se puede eliminar: tiene evaluaciones asociadas.');

        $evaluationCycle->delete();

        return back()->with('success', 'Ciclo eliminado.');
    }

    private function ensureCompanyOwned(EvaluationCycle $evaluationCycle, int $companyId): void
    {
        abort_unless((int) $evaluationCycle->company_id === $companyId, 404);
    }
}
