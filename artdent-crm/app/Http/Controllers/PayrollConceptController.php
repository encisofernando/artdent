<?php

namespace App\Http\Controllers;

use App\Models\PayrollConcept;
use App\Models\PayrollVariable;
use App\Services\Payroll\FormulaEngine;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class PayrollConceptController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', 'regex:/^[0-9]{1,10}$/'],
            'name' => ['required', 'string', 'max:191'],
            'type' => ['required', 'in:remunerative,non_remunerative,deduction,contribution,employer_contribution'],
            'category' => ['nullable', 'in:seguridad_social,obra_social,sindical,art,inssjp,seguro_vida,camaras_empresariales,otros'],
            'calculation_type' => ['required', 'in:fixed,percentage,formula'],
            'affects_sac' => ['boolean'],
            'affects_vacation' => ['boolean'],
            'is_active' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        PayrollConcept::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Concepto creado.');
    }

    public function update(Request $request, PayrollConcept $payrollConcept): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:10', 'regex:/^[0-9]{1,10}$/'],
            'name' => ['required', 'string', 'max:191'],
            'type' => ['required', 'in:remunerative,non_remunerative,deduction,contribution,employer_contribution'],
            'category' => ['nullable', 'in:seguridad_social,obra_social,sindical,art,inssjp,seguro_vida,camaras_empresariales,otros'],
            'calculation_type' => ['required', 'in:fixed,percentage,formula'],
            'affects_sac' => ['boolean'],
            'affects_vacation' => ['boolean'],
            'is_active' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $payrollConcept->update($validated);

        return back()->with('success', 'Concepto actualizado.');
    }

    public function destroy(PayrollConcept $payrollConcept): RedirectResponse
    {
        $payrollConcept->delete();

        return back()->with('success', 'Concepto eliminado.');
    }

    public function simulate(Request $request, FormulaEngine $engine): JsonResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'formula' => ['required', 'string', 'max:2000'],
            'variables' => ['nullable', 'array'],
        ]);

        $availableNames = PayrollVariable::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->pluck('code')
            ->all();

        $syntaxError = $engine->validate($validated['formula'], $availableNames);
        if ($syntaxError) {
            return response()->json(['error' => $syntaxError], 422);
        }

        try {
            $result = $engine->evaluate($validated['formula'], $validated['variables'] ?? []);

            return response()->json(['result' => $result]);
        } catch (\Throwable $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
