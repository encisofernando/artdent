<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeFamilyMember;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmployeeFamilyMemberController extends Controller
{
    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $employee->company_id === $companyId, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'relationship' => ['required', 'string', 'max:50'],
            'dni' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'disability' => ['boolean'],
        ]);

        $employee->familyMembers()->create($validated);

        return back()->with('success', 'Familiar agregado.');
    }

    public function update(Request $request, EmployeeFamilyMember $employeeFamilyMember): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $employeeFamilyMember->employee->company_id === $companyId, 404);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'relationship' => ['required', 'string', 'max:50'],
            'dni' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'disability' => ['boolean'],
        ]);

        $employeeFamilyMember->update($validated);

        return back()->with('success', 'Familiar actualizado.');
    }

    public function destroy(EmployeeFamilyMember $employeeFamilyMember): RedirectResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        abort_unless((int) $employeeFamilyMember->employee->company_id === $companyId, 404);

        $employeeFamilyMember->delete();

        return back()->with('success', 'Familiar eliminado.');
    }
}
