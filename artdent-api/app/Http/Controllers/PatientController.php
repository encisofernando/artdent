<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PatientController extends Controller
{
    /**
     * GET /api/patients
     * Params opcionales: company_id, search, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Patient::query()
            ->when($request->company_id, fn($q) => $q->where('company_id', $request->company_id))
            ->when($request->search, function ($q) use ($request) {
                $term = "%{$request->search}%";
                $q->where(function ($q) use ($term) {
                    $q->where('first_name', 'like', $term)
                      ->orWhere('last_name',  'like', $term)
                      ->orWhere('email',      'like', $term)
                      ->orWhere('phone',      'like', $term);
                });
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        // Si pide paginación devuelve LengthAwarePaginator, si no devuelve colección
        $data = $request->has('per_page')
            ? $query->paginate($request->per_page ?? 50)
            : $query->get();

        return response()->json($data);
    }

    /**
     * POST /api/patients
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'    => 'required|exists:companies,id',
            'first_name'    => 'required|string|max:255',
            'last_name'     => 'required|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender'        => 'nullable|in:male,female,other',
            'phone'         => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:255',
            'address'       => 'nullable|string',
            'notes'         => 'nullable|string',
        ]);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    /**
     * GET /api/patients/{patient}
     */
    public function show(Patient $patient): JsonResponse
    {
        return response()->json($patient->load('jobs'));
    }

    /**
     * PUT /api/patients/{patient}
     */
    public function update(Request $request, Patient $patient): JsonResponse
    {
        $validated = $request->validate([
            'first_name'    => 'sometimes|string|max:255',
            'last_name'     => 'sometimes|string|max:255',
            'date_of_birth' => 'nullable|date',
            'gender'        => 'nullable|in:male,female,other',
            'phone'         => 'nullable|string|max:20',
            'email'         => 'nullable|email|max:255',
            'address'       => 'nullable|string',
            'notes'         => 'nullable|string',
        ]);

        $patient->update($validated);

        return response()->json($patient);
    }

    /**
     * DELETE /api/patients/{patient}
     */
    public function destroy(Patient $patient): JsonResponse
    {
        $patient->delete(); // SoftDelete

        return response()->json(null, 204);
    }
}
