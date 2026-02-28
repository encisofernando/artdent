<?php

namespace App\Http\Controllers;

use App\Models\Tariff;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TariffController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tariffs = Tariff::where('company_id', $request->company_id)
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            })
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        return response()->json($tariffs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'        => 'required|string|max:32|unique:tariffs,code,NULL,id,company_id,' . $request->company_id,
            'name'        => 'required|string|max:191',
            'category'    => 'required|string|max:191',
            'unit'        => 'required|in:pieza,juego,kit,par,unidad',
            'active'      => 'boolean',
            'base_price'  => 'required|numeric|min:0',
            'price_a'     => 'required|numeric|min:0',
            'price_b'     => 'required|numeric|min:0',
            'price_cli'   => 'required|numeric|min:0',
            'price_lab'   => 'required|numeric|min:0',
        ]);

        $tariff = Tariff::create(array_merge($validated, ['company_id' => $request->company_id]));

        return response()->json($tariff, 201);
    }

    public function show(Tariff $tariff): JsonResponse
    {
        $this->authorizeCompany($tariff);
        return response()->json($tariff);
    }

    public function update(Request $request, Tariff $tariff): JsonResponse
    {
        $this->authorizeCompany($tariff);

        $validated = $request->validate([
            'code'        => 'sometimes|required|string|max:32|unique:tariffs,code,' . $tariff->id . ',id,company_id,' . $tariff->company_id,
            'name'        => 'sometimes|required|string|max:191',
            'category'    => 'sometimes|required|string|max:191',
            'unit'        => 'sometimes|required|in:pieza,juego,kit,par,unidad',
            'active'      => 'sometimes|boolean',
            'base_price'  => 'sometimes|required|numeric|min:0',
            'price_a'     => 'sometimes|required|numeric|min:0',
            'price_b'     => 'sometimes|required|numeric|min:0',
            'price_cli'   => 'sometimes|required|numeric|min:0',
            'price_lab'   => 'sometimes|required|numeric|min:0',
        ]);

        $tariff->update($validated);

        return response()->json($tariff);
    }

    public function destroy(Tariff $tariff): JsonResponse
    {
        $this->authorizeCompany($tariff);
        $tariff->delete();
        return response()->json(null, 204);
    }

    private function authorizeCompany(Tariff $tariff): void
    {
        if ($tariff->company_id !== request()->company_id) {
            abort(403, 'No autorizado para esta compañía');
        }
    }
}
