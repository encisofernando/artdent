<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Objective;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ObjectiveController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'title' => ['required', 'string', 'max:191'],
            'target' => ['nullable', 'string', 'max:191'],
            'due_date' => ['nullable', 'date'],
        ]);

        Employee::query()->where('company_id', $companyId)->findOrFail($validated['employee_id']);

        Objective::create([...$validated, 'company_id' => $companyId, 'progress' => 0, 'status' => 'pending']);

        return back()->with('success', 'Objetivo creado.');
    }

    public function update(Request $request, Objective $objective): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $objective->company_id === $companyId, 404);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'target' => ['nullable', 'string', 'max:191'],
            'due_date' => ['nullable', 'date'],
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            'status' => ['required', 'in:pending,in_progress,completed,cancelled'],
        ]);

        $objective->update($validated);

        return back()->with('success', 'Objetivo actualizado.');
    }

    public function destroy(Request $request, Objective $objective): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $objective->company_id === $companyId, 404);

        $objective->delete();

        return back()->with('success', 'Objetivo eliminado.');
    }
}
