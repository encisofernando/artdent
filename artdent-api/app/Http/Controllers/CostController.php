<?php

namespace App\Http\Controllers;

use App\Models\Cost;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $costs = Cost::where('company_id', $request->company_id)
            ->with('job')
            ->when($request->job_id, fn($q) => $q->where('job_id', $request->job_id))
            ->when($request->type, fn($q) => $q->where('type', $request->type))
            ->orderByDesc('created_at')
            ->get();

        return response()->json($costs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_id'       => 'nullable|exists:jobs,id',
            'type'         => 'required|in:material,mano_obra,herramienta,logistica,otros',
            'description'  => 'required|string|max:191',
            'supplier'     => 'nullable|string|max:191',
            'unit'         => 'required|string|max:32',
            'unit_cost'    => 'required|numeric|min:0',
            'quantity'     => 'required|integer|min:1',
            'margin'       => 'required|numeric|min:0|max:1000',
            'total'        => 'required|numeric|min:0',
            'suggested'    => 'required|numeric|min:0',
        ]);

        $cost = Cost::create(array_merge($validated, ['company_id' => $request->company_id]));

        return response()->json($cost->load('job'), 201);
    }

    public function update(Request $request, Cost $cost): JsonResponse
    {
        $this->authorizeCompany($cost);

        $validated = $request->validate([
            'job_id'       => 'nullable|exists:jobs,id',
            'type'         => 'sometimes|required|in:material,mano_obra,herramienta,logistica,otros',
            'description'  => 'sometimes|required|string|max:191',
            'supplier'     => 'nullable|string|max:191',
            'unit'         => 'sometimes|required|string|max:32',
            'unit_cost'    => 'sometimes|required|numeric|min:0',
            'quantity'     => 'sometimes|required|integer|min:1',
            'margin'       => 'sometimes|required|numeric|min:0|max:1000',
            'total'        => 'sometimes|required|numeric|min:0',
            'suggested'    => 'sometimes|required|numeric|min:0',
        ]);

        $cost->update($validated);

        return response()->json($cost->load('job'));
    }

    public function destroy(Cost $cost): JsonResponse
    {
        $this->authorizeCompany($cost);
        $cost->delete();
        return response()->json(null, 204);
    }

    private function authorizeCompany(Cost $cost): void
    {
        if ($cost->company_id !== request()->company_id) {
            abort(403, 'No autorizado para esta compañía');
        }
    }
}
