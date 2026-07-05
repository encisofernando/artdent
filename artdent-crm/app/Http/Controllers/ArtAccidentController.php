<?php

namespace App\Http\Controllers;

use App\Models\ArtAccident;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ArtAccidentController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'occurred_at' => ['required', 'date'],
            'description' => ['required', 'string', 'max:2000'],
            'art_case_number' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:reported,in_treatment,closed'],
            'days_lost' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        Employee::query()->where('company_id', $companyId)->findOrFail($validated['employee_id']);

        ArtAccident::create([...$validated, 'company_id' => $companyId, 'days_lost' => $validated['days_lost'] ?? 0]);

        return back()->with('success', 'Accidente/siniestro ART registrado.');
    }

    public function update(Request $request, ArtAccident $artAccident): RedirectResponse
    {
        $this->ensureCompanyOwned($artAccident, $request->user()->company_id ?? 1);

        $validated = $request->validate([
            'occurred_at' => ['required', 'date'],
            'description' => ['required', 'string', 'max:2000'],
            'art_case_number' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'in:reported,in_treatment,closed'],
            'days_lost' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $artAccident->update([...$validated, 'days_lost' => $validated['days_lost'] ?? 0]);

        return back()->with('success', 'Accidente/siniestro actualizado.');
    }

    public function destroy(Request $request, ArtAccident $artAccident): RedirectResponse
    {
        $this->ensureCompanyOwned($artAccident, $request->user()->company_id ?? 1);

        $artAccident->delete();

        return back()->with('success', 'Registro eliminado.');
    }

    private function ensureCompanyOwned(ArtAccident $artAccident, int $companyId): void
    {
        abort_unless((int) $artAccident->company_id === $companyId, 404);
    }
}
