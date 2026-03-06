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
        public function index()
    {
        $items = \App\Models\Dentist::paginate(10);
        return Inertia::render('Dentist/Index', [
            'items' => $items
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
            'company_id' => 'nullable',
            'code' => 'nullable',
            'type' => 'nullable',
            'name' => 'nullable',
            'contact_name' => 'nullable',
            'email' => 'nullable',
            'phone' => 'nullable',
            'phone_alt' => 'nullable',
            'address' => 'nullable',
            'city' => 'nullable',
            'province' => 'nullable',
            'cuit' => 'nullable',
            'iva_condition' => 'nullable',
            'license_number' => 'nullable',
            'credit_limit' => 'nullable',
            'payment_days' => 'nullable',
            'is_active' => 'nullable',
            'notes' => 'nullable'
        ]);

        \App\Models\Dentist::create($validated);

        return redirect()->route('dentists.index')->with('success', 'Dentist created successfully.');
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
        return Inertia::render('Dentist/Edit', [
            'item' => $dentist
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
        public function update(Request $request, Dentist $dentist)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'code' => 'nullable',
            'type' => 'nullable',
            'name' => 'nullable',
            'contact_name' => 'nullable',
            'email' => 'nullable',
            'phone' => 'nullable',
            'phone_alt' => 'nullable',
            'address' => 'nullable',
            'city' => 'nullable',
            'province' => 'nullable',
            'cuit' => 'nullable',
            'iva_condition' => 'nullable',
            'license_number' => 'nullable',
            'credit_limit' => 'nullable',
            'payment_days' => 'nullable',
            'is_active' => 'nullable',
            'notes' => 'nullable'
        ]);

        $dentist->update($validated);

        return redirect()->route('dentists.index')->with('success', 'Dentist updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
        public function destroy(Dentist $dentist)
    {
        $dentist->delete();
        return redirect()->route('dentists.index')->with('success', 'Dentist deleted successfully.');
    }
}
