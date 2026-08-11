<?php

namespace App\Http\Controllers;

use App\Models\Dentist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DentistController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = \App\Models\Dentist::where('company_id', auth()->user()->company_id);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $items = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

        return Inertia::render('Dentist/Index', [
            'items' => $items,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Dentist/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'type' => 'nullable|string|in:individual,clinic',
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'dni' => 'nullable|string|max:20|unique:dentists,dni',
            'phone' => 'nullable|string|max:64',
            'phone_alt' => 'nullable|string|max:64',
            'whatsapp' => 'nullable|string|max:64',
            'specialty' => 'nullable|string|max:100',
            'zone' => 'nullable|string|max:100',
            'instagram' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'source' => 'nullable|string|in:referido,publicidad,espontaneo,red_social,otro',
            'discount_pct' => 'nullable|numeric|min:0|max:100',
            'preferred_delivery_day' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'cuit' => 'nullable|string|max:50',
            'iva_condition' => 'nullable|string|in:responsable_inscripto,monotributista,exento,consumidor_final',
            'license_number' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric',
            'payment_days' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['company_id'] = auth()->user()->company_id;

        \App\Models\Dentist::create($validated);

        return redirect()->route('dentists.index')->with('success', 'Odontólogo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Dentist $dentist)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Dentist $dentist)
    {
        if ($dentist->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        // Fetch all active tariffs for the company
        $tariffs = \App\Models\Tariff::where('company_id', auth()->user()->company_id)
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        // Fetch the custom prices assigned to this specific dentist
        $customPrices = \App\Models\DentistTariffPrice::where('dentist_id', $dentist->id)
            ->get()
            ->keyBy('tariff_id');

        return Inertia::render('Dentist/Edit', [
            'item' => $dentist,
            'tariffs' => $tariffs,
            'customPrices' => $customPrices,
            'portalUrl' => $dentist->email
                ? route('dentist-portal.login', ['email' => $dentist->email])
                : route('dentist-portal.login'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Dentist $dentist)
    {
        // Enforce company scope
        if ($dentist->company_id !== auth()->user()->company_id) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'code' => 'nullable|string|max:50',
            'type' => 'nullable|string|in:individual,clinic',
            'name' => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'dni' => ['nullable', 'string', 'max:20', \Illuminate\Validation\Rule::unique('dentists', 'dni')->ignore($dentist->id)],
            'phone' => 'nullable|string|max:64',
            'phone_alt' => 'nullable|string|max:64',
            'whatsapp' => 'nullable|string|max:64',
            'specialty' => 'nullable|string|max:100',
            'zone' => 'nullable|string|max:100',
            'instagram' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'source' => 'nullable|string|in:referido,publicidad,espontaneo,red_social,otro',
            'discount_pct' => 'nullable|numeric|min:0|max:100',
            'preferred_delivery_day' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'cuit' => 'nullable|string|max:50',
            'iva_condition' => 'nullable|string|in:responsable_inscripto,monotributista,exento,consumidor_final',
            'license_number' => 'nullable|string|max:50',
            'credit_limit' => 'nullable|numeric',
            'payment_days' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
            'custom_prices' => 'nullable|array',
            'custom_prices.*.tariff_id' => 'required_with:custom_prices|integer|exists:tariffs,id',
            'custom_prices.*.price' => 'required_with:custom_prices|numeric|min:0',
        ]);

        $dentist->update($validated);

        // Sync Custom Prices
        if ($request->has('custom_prices')) {
            $syncData = [];
            foreach ($request->input('custom_prices') as $cp) {
                if (isset($cp['price']) && $cp['price'] !== null && $cp['price'] !== '') {
                    $syncData[$cp['tariff_id']] = ['price' => $cp['price']];
                }
            }
            $dentist->tariffs()->sync($syncData);
        }

        return redirect()->route('dentists.index')->with('success', 'Odontólogo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Dentist $dentist)
    {
        if ($dentist->company_id !== auth()->user()->company_id) {
            abort(403);
        }
        $dentist->delete();

        return redirect()->route('dentists.index')->with('success', 'Odontólogo eliminado exitosamente.');
    }
}
