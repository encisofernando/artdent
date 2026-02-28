<?php

namespace App\Http\Controllers;

use App\Models\Dentist;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class DentistController extends Controller
{
    /**
     * GET /api/dentists
     * Params: company_id, clinic_id, search, active, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Dentist::with('user', 'clinic')
            ->when($request->company_id, fn($q) => $q->where('company_id', $request->company_id))
            ->when($request->clinic_id,  fn($q) => $q->where('clinic_id',  $request->clinic_id))
            ->when($request->boolean('active', true), fn($q) => $q->active())
            ->when($request->search, function ($q) use ($request) {
                $term = "%{$request->search}%";
                $q->where(function ($q) use ($term) {
                    $q->where('email',          'like', $term)
                      ->orWhere('license_number', 'like', $term)
                      ->orWhere('specialty',      'like', $term)
                      ->orWhereHas('user', fn($q) => $q->where('name', 'like', $term));
                });
            })
            ->orderBy('id');

        $data = $request->has('per_page')
            ? $query->paginate($request->per_page ?? 50)
            : $query->get();

        return response()->json($data);
    }

    /**
     * POST /api/dentists
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'user_id'        => 'nullable|exists:users,id',
            'clinic_id'      => 'nullable|exists:clinics,id',
            'license_number' => 'nullable|string|max:50',
            'specialty'      => 'nullable|string|max:100',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $dentist = Dentist::create($validated);

        return response()->json($dentist->load('user', 'clinic'), 201);
    }

    /**
     * GET /api/dentists/{dentist}
     */
    public function show(Dentist $dentist): JsonResponse
    {
        return response()->json(
            $dentist->load('user', 'clinic', 'jobs')
        );
    }

    /**
     * PUT /api/dentists/{dentist}
     */
    public function update(Request $request, Dentist $dentist): JsonResponse
    {
        $validated = $request->validate([
            'user_id'        => 'nullable|exists:users,id',
            'clinic_id'      => 'nullable|exists:clinics,id',
            'license_number' => 'nullable|string|max:50',
            'specialty'      => 'nullable|string|max:100',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $dentist->update($validated);

        return response()->json($dentist->load('user', 'clinic'));
    }

    /**
     * DELETE /api/dentists/{dentist}
     */
    public function destroy(Dentist $dentist): JsonResponse
    {
        $dentist->delete(); // SoftDelete

        return response()->json(null, 204);
    }
}
