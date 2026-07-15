<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\MedicalExam;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MedicalExamController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'type' => ['required', 'in:preocupacional,periodico,egreso'],
            'exam_date' => ['required', 'date'],
            'result' => ['nullable', 'string', 'max:191'],
            'restrictions' => ['nullable', 'string', 'max:2000'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:exam_date'],
        ]);

        Employee::query()->where('company_id', $companyId)->findOrFail($validated['employee_id']);

        MedicalExam::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Examen médico registrado.');
    }

    public function update(Request $request, MedicalExam $medicalExam): RedirectResponse
    {
        $this->ensureCompanyOwned($medicalExam, CompanyContext::id());

        $validated = $request->validate([
            'type' => ['required', 'in:preocupacional,periodico,egreso'],
            'exam_date' => ['required', 'date'],
            'result' => ['nullable', 'string', 'max:191'],
            'restrictions' => ['nullable', 'string', 'max:2000'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:exam_date'],
        ]);

        $medicalExam->update($validated);

        return back()->with('success', 'Examen médico actualizado.');
    }

    public function destroy(Request $request, MedicalExam $medicalExam): RedirectResponse
    {
        $this->ensureCompanyOwned($medicalExam, CompanyContext::id());

        $medicalExam->delete();

        return back()->with('success', 'Examen médico eliminado.');
    }

    private function ensureCompanyOwned(MedicalExam $medicalExam, int $companyId): void
    {
        abort_unless((int) $medicalExam->company_id === $companyId, 404);
    }
}
