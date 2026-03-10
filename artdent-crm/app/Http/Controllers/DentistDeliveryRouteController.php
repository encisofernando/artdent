<?php

namespace App\Http\Controllers;

use App\Models\Dentist;
use App\Models\DentistDeliveryRoute;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DentistDeliveryRouteController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        $query = DentistDeliveryRoute::where('company_id', $companyId)
            ->with('dentist:id,name');

        if ($request->filled('dentist_id')) {
            $query->where('dentist_id', $request->dentist_id);
        }

        if ($request->filled('delivery_day')) {
            $query->where('delivery_day', $request->delivery_day);
        }

        if ($request->boolean('active_only', true)) {
            $query->where('is_active', true);
        }

        $items = $query->orderBy('delivery_day')->orderBy('delivery_order')->get();

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('DentistDeliveryRoute/Index', [
            'items' => $items,
            'dentists' => $dentists,
            'filters' => $request->only(['dentist_id', 'delivery_day', 'active_only']),
        ]);
    }

    public function create(): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('DentistDeliveryRoute/Create', [
            'dentists' => $dentists,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = auth()->user()->company_id;

        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'route_name' => 'nullable|string|max:100',
            'delivery_day' => 'nullable|integer|min:1|max:7',
            'delivery_order' => 'nullable|integer|min:0',
            'address' => 'nullable|string|max:255',
            'contact_name' => 'nullable|string|max:191',
            'contact_phone' => 'nullable|string|max:64',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $dentist = Dentist::findOrFail($validated['dentist_id']);
        if ($dentist->company_id !== $companyId) {
            abort(403);
        }

        DentistDeliveryRoute::create(array_merge($validated, [
            'company_id' => $companyId,
        ]));

        return redirect()->route('dentist-delivery-routes.index')
            ->with('success', 'Ruta de entrega creada exitosamente.');
    }

    public function edit(DentistDeliveryRoute $dentistDeliveryRoute): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        if ($dentistDeliveryRoute->company_id !== $companyId) {
            abort(403);
        }

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('DentistDeliveryRoute/Edit', [
            'item' => $dentistDeliveryRoute,
            'dentists' => $dentists,
        ]);
    }

    public function update(Request $request, DentistDeliveryRoute $dentistDeliveryRoute): \Illuminate\Http\RedirectResponse
    {
        $companyId = auth()->user()->company_id;

        if ($dentistDeliveryRoute->company_id !== $companyId) {
            abort(403);
        }

        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'route_name' => 'nullable|string|max:100',
            'delivery_day' => 'nullable|integer|min:1|max:7',
            'delivery_order' => 'nullable|integer|min:0',
            'address' => 'nullable|string|max:255',
            'contact_name' => 'nullable|string|max:191',
            'contact_phone' => 'nullable|string|max:64',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $dentist = Dentist::findOrFail($validated['dentist_id']);
        if ($dentist->company_id !== $companyId) {
            abort(403);
        }

        $dentistDeliveryRoute->update($validated);

        return redirect()->route('dentist-delivery-routes.index')
            ->with('success', 'Ruta de entrega actualizada exitosamente.');
    }

    public function destroy(DentistDeliveryRoute $dentistDeliveryRoute): \Illuminate\Http\RedirectResponse
    {
        if ($dentistDeliveryRoute->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $dentistDeliveryRoute->delete();

        return redirect()->route('dentist-delivery-routes.index')
            ->with('success', 'Ruta de entrega eliminada.');
    }
}
