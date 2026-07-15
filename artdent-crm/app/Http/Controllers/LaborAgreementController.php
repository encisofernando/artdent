<?php

namespace App\Http\Controllers;

use App\Models\LaborAgreement;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LaborAgreementController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ]);

        LaborAgreement::create(array_merge($validated, ['company_id' => $companyId]));

        return back()->with('success', 'Convenio creado.');
    }

    public function update(Request $request, LaborAgreement $laborAgreement): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'code' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['boolean'],
        ]);

        $laborAgreement->update($validated);

        return back()->with('success', 'Convenio actualizado.');
    }

    public function destroy(LaborAgreement $laborAgreement): RedirectResponse
    {
        abort_if(
            $laborAgreement->categories()->exists(),
            422,
            'No se puede eliminar: tiene categorías asociadas.'
        );

        $laborAgreement->delete();

        return back()->with('success', 'Convenio eliminado.');
    }
}
