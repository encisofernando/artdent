<?php

namespace App\Http\Controllers;

use App\Models\EvaluationCriterion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EvaluationCriterionController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'evaluation_cycle_id' => ['required', 'integer', 'exists:evaluation_cycles,id'],
            'name' => ['required', 'string', 'max:191'],
            'weight' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        EvaluationCriterion::create($validated);

        return back()->with('success', 'Criterio agregado.');
    }

    public function update(Request $request, EvaluationCriterion $evaluationCriterion): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'weight' => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $evaluationCriterion->update($validated);

        return back()->with('success', 'Criterio actualizado.');
    }

    public function destroy(EvaluationCriterion $evaluationCriterion): RedirectResponse
    {
        $evaluationCriterion->delete();

        return back()->with('success', 'Criterio eliminado.');
    }
}
