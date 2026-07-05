<?php

namespace App\Http\Controllers;

use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LeaveTypeController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:191'],
            'category' => ['required', 'in:vacaciones,enfermedad,maternidad_paternidad,estudio,matrimonio,fallecimiento,otro'],
            'paid' => ['boolean'],
            'requires_certificate' => ['boolean'],
            'max_days_per_year' => ['nullable', 'integer', 'min:0', 'max:365'],
            'is_active' => ['boolean'],
        ]);

        LeaveType::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Tipo de licencia creado.');
    }

    public function update(Request $request, LeaveType $leaveType): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:20'],
            'name' => ['required', 'string', 'max:191'],
            'category' => ['required', 'in:vacaciones,enfermedad,maternidad_paternidad,estudio,matrimonio,fallecimiento,otro'],
            'paid' => ['boolean'],
            'requires_certificate' => ['boolean'],
            'max_days_per_year' => ['nullable', 'integer', 'min:0', 'max:365'],
            'is_active' => ['boolean'],
        ]);

        $leaveType->update($validated);

        return back()->with('success', 'Tipo de licencia actualizado.');
    }

    public function destroy(LeaveType $leaveType): RedirectResponse
    {
        abort_if(
            $leaveType->requests()->exists(),
            422,
            'No se puede eliminar: tiene solicitudes asociadas. Desactivalo en su lugar.',
        );

        $leaveType->delete();

        return back()->with('success', 'Tipo de licencia eliminado.');
    }
}
