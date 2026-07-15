<?php

namespace App\Http\Controllers;

use App\Models\CashDrawer;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashDrawerController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();

        $drawers = CashDrawer::query()
            ->with(['branch:id,name', 'cash_sessions' => function ($query) {
                $query->where('status', 'open')->latest('opened_at')->limit(1)->with('user:id,name');
            }])
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get();

        return Inertia::render('Caja/Drawers', [
            'drawers' => $drawers,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'is_active' => ['boolean'],
        ]);

        CashDrawer::create([
            'company_id' => $companyId,
            'branch_id' => $validated['branch_id'] ?? null,
            'name' => $validated['name'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('cash-drawers.index')->with('success', 'Caja creada exitosamente.');
    }

    public function update(Request $request, CashDrawer $cashDrawer): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'is_active' => ['boolean'],
        ]);

        $cashDrawer->update($validated);

        return redirect()->route('cash-drawers.index')->with('success', 'Caja actualizada.');
    }

    public function destroy(CashDrawer $cashDrawer): RedirectResponse
    {
        if ($cashDrawer->cash_sessions()->exists()) {
            return back()->with('error', 'No se puede eliminar una caja que ya tiene sesiones registradas. Desactivala en su lugar.');
        }

        $cashDrawer->delete();

        return redirect()->route('cash-drawers.index')->with('success', 'Caja eliminada.');
    }
}
