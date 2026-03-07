<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Dentist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PatientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // Enforce company scope via dentist relationship
        $companyId = auth()->user()->company_id;
        
        $query = Patient::whereHas('dentist', function ($q) use ($companyId) {
            $q->where('company_id', $companyId);
        })->with('dentist');

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->has('dentist_id') && $request->dentist_id !== 'all') {
            $query->where('dentist_id', $request->dentist_id);
        }

        $items = $query->orderBy('name', 'asc')->paginate(10)->withQueryString();

        // Get dentists for the filter dropdown
        $dentists = Dentist::where('company_id', $companyId)
                           ->where('is_active', true)
                           ->orderBy('name', 'asc')
                           ->get(['id', 'name']);

        return Inertia::render('Patient/Index', [
            'items' => $items,
            'dentists' => $dentists,
            'filters' => $request->only(['search', 'dentist_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $companyId = auth()->user()->company_id;
        $dentists = Dentist::where('company_id', $companyId)
                           ->where('is_active', true)
                           ->orderBy('name', 'asc')
                           ->get(['id', 'name', 'code']);

        return Inertia::render('Patient/Create', [
            'dentists' => $dentists
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:Masculino,Femenino,Otro',
            'phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string'
        ]);

        // Security check: ensure the dentist belongs to the user's company
        $dentist = Dentist::findOrFail($validated['dentist_id']);
        if ($dentist->company_id !== auth()->user()->company_id) {
            abort(403, 'Unauthorized action.');
        }

        Patient::create($validated);

        return redirect()->route('patients.index')->with('success', 'Paciente creado exitosamente.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient)
    {
        // Security check
        if ($patient->dentist->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $companyId = auth()->user()->company_id;
        $dentists = Dentist::where('company_id', $companyId)
                           ->where('is_active', true)
                           ->orderBy('name', 'asc')
                           ->get(['id', 'name', 'code']);

        return Inertia::render('Patient/Edit', [
            'item' => $patient,
            'dentists' => $dentists
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        // Security check on existing patient
        if ($patient->dentist->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $validated = $request->validate([
            'dentist_id' => 'required|exists:dentists,id',
            'name' => 'required|string|max:255',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|in:Masculino,Femenino,Otro',
            'phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string'
        ]);

        // Security check on target dentist
        $dentist = Dentist::findOrFail($validated['dentist_id']);
        if ($dentist->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $patient->update($validated);

        return redirect()->route('patients.index')->with('success', 'Paciente actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        if ($patient->dentist->company_id !== auth()->user()->company_id) {
            abort(403);
        }
        $patient->delete();
        return redirect()->route('patients.index')->with('success', 'Paciente eliminado exitosamente.');
    }
}
