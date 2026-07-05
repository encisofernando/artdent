<?php

namespace App\Http\Controllers;

use App\Models\PayrollVariable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PayrollVariableController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:60', 'regex:/^[a-z][a-z0-9_]*$/'],
            'name' => ['required', 'string', 'max:191'],
            'data_type' => ['required', 'in:number,bool,date,string'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        PayrollVariable::create([...$validated, 'company_id' => $companyId, 'source' => 'manual']);

        return back()->with('success', 'Variable creada.');
    }

    public function update(Request $request, PayrollVariable $payrollVariable): RedirectResponse
    {
        abort_if($payrollVariable->source === 'system', 422, 'Las variables del sistema no se pueden editar.');

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:60', 'regex:/^[a-z][a-z0-9_]*$/'],
            'name' => ['required', 'string', 'max:191'],
            'data_type' => ['required', 'in:number,bool,date,string'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['boolean'],
        ]);

        $payrollVariable->update($validated);

        return back()->with('success', 'Variable actualizada.');
    }

    public function destroy(PayrollVariable $payrollVariable): RedirectResponse
    {
        abort_if($payrollVariable->source === 'system', 422, 'Las variables del sistema no se pueden eliminar.');

        $payrollVariable->delete();

        return back()->with('success', 'Variable eliminada.');
    }
}
