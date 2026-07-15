<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'parent_id' => ['nullable', 'integer', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:191'],
            'is_active' => ['boolean'],
        ]);

        Department::create(array_merge($validated, ['company_id' => $companyId]));

        return back()->with('success', 'Departamento creado.');
    }

    public function update(Request $request, Department $department): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $department->company_id === $companyId, 404);

        $validated = $request->validate([
            'parent_id' => ['nullable', 'integer', 'exists:departments,id', 'different:id'],
            'name' => ['required', 'string', 'max:191'],
            'is_active' => ['boolean'],
        ]);

        $department->update($validated);

        return back()->with('success', 'Departamento actualizado.');
    }

    public function destroy(Department $department): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $department->company_id === $companyId, 404);

        abort_if(
            $department->employees()->exists() || $department->positions()->exists() || $department->children()->exists(),
            422,
            'No se puede eliminar: tiene empleados, puestos o subdepartamentos asociados.'
        );

        $department->delete();

        return back()->with('success', 'Departamento eliminado.');
    }
}
