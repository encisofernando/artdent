<?php

namespace App\Http\Controllers;

use App\Models\ShippingMotoCompany;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingMotoCompanyController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ShippingMotoCompany::query();

        if ($search = $request->input('search')) {
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->input('status') === 'active') {
            $query->where('is_active', true);
        } elseif ($request->input('status') === 'inactive') {
            $query->where('is_active', false);
        }

        $items = $query->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('ShippingMotoCompany/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('ShippingMotoCompany/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'price' => 'required|numeric|min:0',
            'zone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        ShippingMotoCompany::create($validated);

        return redirect()->route('shipping-moto-companies.index')
            ->with('success', 'Empresa de moto mandados creada con éxito.');
    }

    public function edit(ShippingMotoCompany $shippingMotoCompany): Response
    {
        return Inertia::render('ShippingMotoCompany/Edit', ['item' => $shippingMotoCompany]);
    }

    public function update(Request $request, ShippingMotoCompany $shippingMotoCompany): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'price' => 'required|numeric|min:0',
            'zone' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $shippingMotoCompany->update($validated);

        return redirect()->route('shipping-moto-companies.index')
            ->with('success', 'Empresa de moto mandados actualizada.');
    }

    public function destroy(ShippingMotoCompany $shippingMotoCompany): RedirectResponse
    {
        $shippingMotoCompany->delete();

        return redirect()->route('shipping-moto-companies.index')
            ->with('success', 'Empresa de moto mandados eliminada.');
    }
}
