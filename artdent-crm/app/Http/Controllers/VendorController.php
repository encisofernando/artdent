<?php

namespace App\Http\Controllers;

use App\Models\Vendor;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Vendor::query();

        if ($search) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('cuit', 'like', "%{$search}%")
                ->orWhere('contact_name', 'like', "%{$search}%");
        }

        if ($status === 'active') {
            $query->where('is_active', 1);
        } elseif ($status === 'inactive') {
            $query->where('is_active', 0);
        }

        $items = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Vendor/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Vendor/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'cuit' => 'nullable|string|max:50',
            'iva_condition' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated['company_id'] = CompanyContext::id();

        Vendor::create($validated);

        return redirect()->route('vendors.index')->with('success', 'Proveedor creado exitosamente.');
    }

    public function show(Vendor $vendor)
    {
        //
    }

    public function edit(Vendor $vendor)
    {
        return Inertia::render('Vendor/Edit', [
            'item' => $vendor,
        ]);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'cuit' => 'nullable|string|max:50',
            'iva_condition' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $vendor->update($validated);

        return redirect()->route('vendors.index')->with('success', 'Proveedor actualizado exitosamente.');
    }

    public function destroy(Vendor $vendor)
    {
        $vendor->delete();

        return redirect()->route('vendors.index')->with('success', 'Proveedor eliminado exitosamente.');
    }
}
