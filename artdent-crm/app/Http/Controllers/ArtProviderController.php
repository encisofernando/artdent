<?php

namespace App\Http\Controllers;

use App\Models\ArtProvider;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ArtProviderController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'cuit' => ['nullable', 'string', 'max:20'],
            'policy_number' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        ArtProvider::create([...$validated, 'company_id' => $companyId]);

        return back()->with('success', 'ART creada.');
    }

    public function update(Request $request, ArtProvider $artProvider): RedirectResponse
    {
        $this->ensureCompanyOwned($artProvider, CompanyContext::id());

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'cuit' => ['nullable', 'string', 'max:20'],
            'policy_number' => ['nullable', 'string', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        $artProvider->update($validated);

        return back()->with('success', 'ART actualizada.');
    }

    public function destroy(Request $request, ArtProvider $artProvider): RedirectResponse
    {
        $this->ensureCompanyOwned($artProvider, CompanyContext::id());

        abort_if(
            $artProvider->employees()->exists(),
            422,
            'No se puede eliminar: hay empleados asignados a esta ART.',
        );

        $artProvider->delete();

        return back()->with('success', 'ART eliminada.');
    }

    private function ensureCompanyOwned(ArtProvider $artProvider, int $companyId): void
    {
        abort_unless((int) $artProvider->company_id === $companyId, 404);
    }
}
