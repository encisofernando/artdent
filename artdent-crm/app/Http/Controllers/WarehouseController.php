<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = auth()->user()->company_id ?? 1;
        $search = $request->input('search');

        $query = Warehouse::query()
            ->withCount('stocks')
            ->where('company_id', $companyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Warehouse/Index', [
            'items' => $items,
            'filters' => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = auth()->user()->company_id ?? 1;

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        Warehouse::create([
            'company_id' => $companyId,
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'address' => $validated['address'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('warehouses.index')
            ->with('success', 'Depósito creado exitosamente.');
    }

    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'code' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
        ]);

        $warehouse->update($validated);

        return redirect()->route('warehouses.index')
            ->with('success', 'Depósito actualizado exitosamente.');
    }

    public function destroy(Warehouse $warehouse): RedirectResponse
    {
        $hasStock = $warehouse->stocks()->where('quantity', '>', 0)->exists();

        if ($hasStock) {
            return back()->with('error', 'No se puede eliminar un depósito con stock existente.');
        }

        $warehouse->delete();

        return redirect()->route('warehouses.index')
            ->with('success', 'Depósito eliminado.');
    }
}
