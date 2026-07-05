<?php

namespace App\Http\Controllers;

use App\Models\SalaryScale;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class SalaryScaleController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'labor_agreement_category_id' => ['required', 'integer', 'exists:labor_agreement_categories,id'],
            'base_amount' => ['required', 'numeric', 'min:0'],
            'effective_from' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $effectiveFrom = Carbon::parse($validated['effective_from']);

        SalaryScale::where('labor_agreement_category_id', $validated['labor_agreement_category_id'])
            ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', $effectiveFrom))
            ->where('effective_from', '<', $effectiveFrom)
            ->update(['effective_to' => $effectiveFrom->copy()->subDay()]);

        SalaryScale::create([
            ...$validated,
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Escala salarial registrada.');
    }

    public function destroy(SalaryScale $salaryScale): RedirectResponse
    {
        $isLatest = ! SalaryScale::where('labor_agreement_category_id', $salaryScale->labor_agreement_category_id)
            ->where('effective_from', '>', $salaryScale->effective_from)
            ->exists();

        abort_unless($isLatest, 422, 'Solo se puede eliminar la escala vigente más reciente.');

        $previous = SalaryScale::where('labor_agreement_category_id', $salaryScale->labor_agreement_category_id)
            ->where('id', '!=', $salaryScale->id)
            ->orderByDesc('effective_from')
            ->first();

        $salaryScale->delete();

        if ($previous) {
            $previous->update(['effective_to' => null]);
        }

        return back()->with('success', 'Escala salarial eliminada.');
    }
}
