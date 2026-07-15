<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Evaluation;
use App\Models\EvaluationCycle;
use App\Models\EvaluationScore;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'evaluation_cycle_id' => ['required', 'integer', 'exists:evaluation_cycles,id'],
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'evaluator_id' => ['nullable', 'integer', 'exists:employees,id'],
        ]);

        $cycle = EvaluationCycle::query()->where('company_id', $companyId)->findOrFail($validated['evaluation_cycle_id']);
        Employee::query()->where('company_id', $companyId)->findOrFail($validated['employee_id']);

        Evaluation::create([
            'company_id' => $companyId,
            'evaluation_cycle_id' => $cycle->id,
            'employee_id' => $validated['employee_id'],
            'evaluator_id' => $validated['evaluator_id'] ?? null,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Evaluación creada.');
    }

    /**
     * Actualiza estado/resumen y guarda (upsert) los puntajes por criterio.
     * `scores`: [{criterion_id, score, comment}]
     */
    public function update(Request $request, Evaluation $evaluation): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $evaluation->company_id === $companyId, 404);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,in_progress,completed'],
            'summary' => ['nullable', 'string', 'max:2000'],
            'scores' => ['nullable', 'array'],
            'scores.*.criterion_id' => ['required_with:scores', 'integer', 'exists:evaluation_criteria,id'],
            'scores.*.score' => ['required_with:scores', 'numeric', 'min:0', 'max:10'],
            'scores.*.comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $evaluation->update([
            'status' => $validated['status'],
            'summary' => $validated['summary'] ?? $evaluation->summary,
        ]);

        foreach ($validated['scores'] ?? [] as $scoreData) {
            EvaluationScore::updateOrCreate(
                ['evaluation_id' => $evaluation->id, 'evaluation_criterion_id' => $scoreData['criterion_id']],
                ['score' => $scoreData['score'], 'comment' => $scoreData['comment'] ?? null],
            );
        }

        return back()->with('success', 'Evaluación actualizada.');
    }

    public function destroy(Request $request, Evaluation $evaluation): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $evaluation->company_id === $companyId, 404);

        $evaluation->delete();

        return back()->with('success', 'Evaluación eliminada.');
    }
}
