<?php

namespace App\Http\Controllers;

use App\Models\PayrollConceptVersion;
use App\Models\PayrollVariable;
use App\Services\Payroll\FormulaEngine;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PayrollConceptVersionController extends Controller
{
    public function store(Request $request, FormulaEngine $engine): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'payroll_concept_id' => ['required', 'integer', 'exists:payroll_concepts,id'],
            'formula' => ['required', 'string', 'max:2000'],
            'effective_from' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $availableNames = PayrollVariable::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->pluck('code')
            ->all();

        $syntaxError = $engine->validate($validated['formula'], $availableNames);
        if ($syntaxError) {
            throw ValidationException::withMessages(['formula' => $syntaxError]);
        }

        $effectiveFrom = Carbon::parse($validated['effective_from']);

        PayrollConceptVersion::where('payroll_concept_id', $validated['payroll_concept_id'])
            ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', $effectiveFrom))
            ->where('effective_from', '<', $effectiveFrom)
            ->update(['effective_to' => $effectiveFrom->copy()->subDay()]);

        PayrollConceptVersion::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Versión de fórmula registrada.');
    }

    public function destroy(PayrollConceptVersion $payrollConceptVersion): RedirectResponse
    {
        $isLatest = ! PayrollConceptVersion::where('payroll_concept_id', $payrollConceptVersion->payroll_concept_id)
            ->where('effective_from', '>', $payrollConceptVersion->effective_from)
            ->exists();

        abort_unless($isLatest, 422, 'Solo se puede eliminar la versión vigente más reciente.');

        $previous = PayrollConceptVersion::where('payroll_concept_id', $payrollConceptVersion->payroll_concept_id)
            ->where('id', '!=', $payrollConceptVersion->id)
            ->orderByDesc('effective_from')
            ->first();

        $payrollConceptVersion->delete();

        if ($previous) {
            $previous->update(['effective_to' => null]);
        }

        return back()->with('success', 'Versión eliminada.');
    }
}
