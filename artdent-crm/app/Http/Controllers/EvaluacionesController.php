<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EvaluationCycle;
use App\Models\Objective;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluacionesController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;

        $cycles = EvaluationCycle::query()
            ->where('company_id', $companyId)
            ->with([
                'criteria',
                'evaluations.employee.user:id,name',
                'evaluations.evaluator.user:id,name',
                'evaluations.scores.criterion',
            ])
            ->orderByDesc('period_start')
            ->get()
            ->map(function (EvaluationCycle $cycle) {
                $cycle->evaluations->each(function ($evaluation) {
                    $evaluation->setAttribute('weighted_score', $evaluation->weightedScore());
                });

                return $cycle;
            });

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'user_id']);

        $objectives = Objective::query()
            ->with('employee.user:id,name')
            ->where('company_id', $companyId)
            ->orderByDesc('due_date')
            ->get();

        return Inertia::render('Rrhh/Evaluaciones/Index', [
            'cycles' => $cycles,
            'employees' => $employees,
            'objectives' => $objectives,
        ]);
    }
}
