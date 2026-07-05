<?php

namespace App\Http\Controllers;

use App\Models\LaborAgreementCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class LaborAgreementCategoryController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'labor_agreement_id' => ['required', 'integer', 'exists:labor_agreements,id'],
            'name' => ['required', 'string', 'max:191'],
            'code' => ['nullable', 'string', 'max:50'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        LaborAgreementCategory::create($validated);

        return back()->with('success', 'Categoría creada.');
    }

    public function update(Request $request, LaborAgreementCategory $laborAgreementCategory): RedirectResponse
    {
        $validated = $request->validate([
            'labor_agreement_id' => ['required', 'integer', 'exists:labor_agreements,id'],
            'name' => ['required', 'string', 'max:191'],
            'code' => ['nullable', 'string', 'max:50'],
            'order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['boolean'],
        ]);

        $laborAgreementCategory->update($validated);

        return back()->with('success', 'Categoría actualizada.');
    }

    public function destroy(LaborAgreementCategory $laborAgreementCategory): RedirectResponse
    {
        abort_if(
            $laborAgreementCategory->employees()->exists(),
            422,
            'No se puede eliminar: hay empleados asignados a esta categoría.'
        );

        $laborAgreementCategory->delete();

        return back()->with('success', 'Categoría eliminada.');
    }
}
