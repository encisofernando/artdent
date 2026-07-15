<?php

namespace App\Http\Controllers;

use App\Models\Training;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class TrainingController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'provider' => ['nullable', 'string', 'max:191'],
            'hours' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'category' => ['nullable', 'string', 'max:100'],
        ]);

        Training::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'Capacitación creada.');
    }

    public function update(Request $request, Training $training): RedirectResponse
    {
        $this->ensureCompanyOwned($training, CompanyContext::id());

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'provider' => ['nullable', 'string', 'max:191'],
            'hours' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'category' => ['nullable', 'string', 'max:100'],
        ]);

        $training->update($validated);

        return back()->with('success', 'Capacitación actualizada.');
    }

    public function destroy(Request $request, Training $training): RedirectResponse
    {
        $this->ensureCompanyOwned($training, CompanyContext::id());

        abort_if($training->sessions()->exists(), 422, 'No se puede eliminar: tiene sesiones asociadas.');

        $training->delete();

        return back()->with('success', 'Capacitación eliminada.');
    }

    private function ensureCompanyOwned(Training $training, int $companyId): void
    {
        abort_unless((int) $training->company_id === $companyId, 404);
    }
}
