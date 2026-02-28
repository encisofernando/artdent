<?php

namespace App\Http\Controllers;

use App\Models\Clinic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * ClientController
 *
 * "Clientes" del laboratorio = clínicas/odontólogos en tabla `clinics`.
 * Expuesto como /api/clients para el frontend.
 */
class ClientController extends Controller
{
    /**
     * GET /api/clients
     * Params: company_id, search, type, per_page
     */
    public function index(Request $request): JsonResponse
    {
        $query = Clinic::query()
            ->when($request->company_id, fn($q) => $q->where('company_id', $request->company_id))
            ->when($request->type,       fn($q) => $q->where('type', $request->type))
            ->when($request->search, function ($q) use ($request) {
                $term = "%{$request->search}%";
                $q->where(function ($q) use ($term) {
                    $q->where('name',           'like', $term)
                      ->orWhere('contact_person', 'like', $term)
                      ->orWhere('email',          'like', $term)
                      ->orWhere('cuit',           'like', $term);
                });
            })
            ->where('active', true)
            ->orderBy('name');

        $data = $request->has('per_page')
            ? $query->paginate($request->per_page ?? 50)
            : $query->get();

        return response()->json($data);
    }

    /**
     * POST /api/clients
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'company_id'     => 'required|exists:companies,id',
            'name'           => 'required|string|max:255',
            'type'           => 'required|in:clinica,odontologo,otrolab,colegio,particular',
            'address'        => 'nullable|string',
            'city'           => 'nullable|string|max:100',
            'state'          => 'nullable|string|max:100',
            'postal_code'    => 'nullable|string|max:20',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'cuit'           => 'nullable|string|max:32',
            'notes'          => 'nullable|string',
        ]);

        $client = Clinic::create($validated);

        return response()->json($client, 201);
    }

    /**
     * GET /api/clients/{client}
     */
    public function show(Clinic $client): JsonResponse
    {
        return response()->json($client->load('dentists', 'jobs'));
    }

    /**
     * PUT /api/clients/{client}
     */
    public function update(Request $request, Clinic $client): JsonResponse
    {
        $validated = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'type'           => 'sometimes|in:clinica,odontologo,otrolab,colegio,particular',
            'address'        => 'nullable|string',
            'city'           => 'nullable|string|max:100',
            'state'          => 'nullable|string|max:100',
            'postal_code'    => 'nullable|string|max:20',
            'phone'          => 'nullable|string|max:20',
            'email'          => 'nullable|email|max:255',
            'contact_person' => 'nullable|string|max:255',
            'cuit'           => 'nullable|string|max:32',
            'notes'          => 'nullable|string',
            'active'         => 'boolean',
        ]);

        $client->update($validated);

        return response()->json($client);
    }

    /**
     * DELETE /api/clients/{client}
     */
    public function destroy(Clinic $client): JsonResponse
    {
        $client->delete();

        return response()->json(null, 204);
    }
}
