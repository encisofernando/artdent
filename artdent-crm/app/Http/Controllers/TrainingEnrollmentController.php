<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\TrainingEnrollment;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingEnrollmentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'training_session_id' => ['required', 'integer', 'exists:training_sessions,id'],
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
        ]);

        Employee::query()->where('company_id', $companyId)->findOrFail($validated['employee_id']);

        TrainingEnrollment::create([...$validated, 'status' => 'enrolled']);

        return back()->with('success', 'Inscripción registrada.');
    }

    public function update(Request $request, TrainingEnrollment $trainingEnrollment): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:enrolled,completed,failed,cancelled'],
            'score' => ['nullable', 'numeric', 'min:0', 'max:10'],
        ]);

        $trainingEnrollment->update([
            ...$validated,
            'completed_at' => $validated['status'] === 'completed' ? now() : $trainingEnrollment->completed_at,
        ]);

        return back()->with('success', 'Inscripción actualizada.');
    }

    public function destroy(TrainingEnrollment $trainingEnrollment): RedirectResponse
    {
        $trainingEnrollment->delete();

        return back()->with('success', 'Inscripción eliminada.');
    }
}
