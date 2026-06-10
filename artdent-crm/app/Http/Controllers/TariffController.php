<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TariffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $companyId = auth()->user()->company_id;

        $query = Tariff::where('company_id', $companyId);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        $items = $query->with('costs')->orderBy('name', 'asc')->paginate(15)->withQueryString();

        // Get unique categories for the filter dropdown
        $categories = Tariff::where('company_id', $companyId)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category');

        return Inertia::render('Tariff/Index', [
            'items' => $items,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Tariff/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            // El precio base ahora puede venir precalculado del front, o no.
            'price' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
            'costs' => 'nullable|array',
            'costs.*.type' => 'required|string',
            'costs.*.description' => 'required|string',
            'costs.*.supplier' => 'nullable|string',
            'costs.*.unit' => 'nullable|string',
            'costs.*.unit_cost' => 'required|numeric|min:0',
            'costs.*.quantity' => 'required|numeric|min:0',
            'costs.*.margin_pct' => 'required|numeric|min:0',
        ]);

        $calculatedPrice = 0;
        if (! empty($validated['costs'])) {
            foreach ($validated['costs'] as $cost) {
                $totalCost = $cost['unit_cost'] * $cost['quantity'];
                $suggestedPrice = round($totalCost * (1 + ($cost['margin_pct'] / 100)), 2);
                $calculatedPrice += $suggestedPrice;
            }
        }

        // Si mandaron price manual lo usamos, si no usamos el calculado.
        $finalPrice = isset($validated['price']) && $validated['price'] > 0
            ? $validated['price']
            : $calculatedPrice;

        $tariff = Tariff::create([
            'company_id' => auth()->user()->company_id,
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Otros',
            'price' => $finalPrice,
            'unit' => $validated['unit'] ?? 'unidad',
            'description' => $validated['description'],
            'is_active' => $validated['is_active'],
        ]);

        if (! empty($validated['costs'])) {
            $tariff->costs()->createMany($validated['costs']);
        }

        return redirect()->route('tariffs.index')->with('success', 'Arancel creado exitosamente.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tariff $tariff)
    {
        if ($tariff->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        return Inertia::render('Tariff/Edit', [
            'item' => $tariff->load('costs', 'phases'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Tariff $tariff)
    {
        if ($tariff->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'price' => 'nullable|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'required|boolean',
            'costs' => 'nullable|array',
            'costs.*.type' => 'required|string',
            'costs.*.description' => 'required|string',
            'costs.*.supplier' => 'nullable|string',
            'costs.*.unit' => 'nullable|string',
            'costs.*.unit_cost' => 'required|numeric|min:0',
            'costs.*.quantity' => 'required|numeric|min:0',
            'costs.*.margin_pct' => 'required|numeric|min:0',
        ]);

        $calculatedPrice = 0;
        if (! empty($validated['costs'])) {
            foreach ($validated['costs'] as $cost) {
                $totalCost = $cost['unit_cost'] * $cost['quantity'];
                $suggestedPrice = round($totalCost * (1 + ($cost['margin_pct'] / 100)), 2);
                $calculatedPrice += $suggestedPrice;
            }
        }

        $finalPrice = isset($validated['price']) && $validated['price'] > 0
            ? $validated['price']
            : $calculatedPrice;

        $tariff->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'category' => $validated['category'] ?? 'Otros',
            'price' => $finalPrice,
            'unit' => $validated['unit'] ?? 'unidad',
            'description' => $validated['description'],
            'is_active' => $validated['is_active'],
        ]);

        // Reemplazar costos.
        $tariff->costs()->delete();
        if (! empty($validated['costs'])) {
            $tariff->costs()->createMany($validated['costs']);
        }

        return redirect()->route('tariffs.index')->with('success', 'Arancel actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Tariff $tariff)
    {
        if ($tariff->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $tariff->delete();

        return redirect()->route('tariffs.index')->with('success', 'Arancel eliminado exitosamente.');
    }
}
