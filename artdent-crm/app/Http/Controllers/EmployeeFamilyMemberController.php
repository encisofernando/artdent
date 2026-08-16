<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeFamilyMember;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class EmployeeFamilyMemberController extends Controller
{
    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $companyId = CompanyContext::id();
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
        $companyId = CompanyContext::id();
        // Employee tiene BelongsToCompany: si el familiar quedó huérfano de un
        // empleado de otra empresa, la relación devuelve null en vez de la fila
        // ajena. ?-> evita un 500 (null->company_id) donde debería ser 404.
        abort_unless((int) $employeeFamilyMember->employee?->company_id === $companyId, 404);

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
        $companyId = CompanyContext::id();
        // Ver comentario en update(): employee->company_id puede ser null
        // (Employee tiene BelongsToCompany) para un familiar cross-empresa.
        abort_unless((int) $employeeFamilyMember->employee?->company_id === $companyId, 404);

        $employeeFamilyMember->delete();

        return back()->with('success', 'Familiar eliminado.');
    }
}
