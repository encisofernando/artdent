<?php

namespace App\Http\Controllers;

use App\Models\Tax;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Catálogo global de alícuotas de IVA — no tiene company_id (no es
 * multi-empresa, es el mismo catálogo de tasas para todo el tenant). Mismo
 * criterio de UI que PaymentMethodController: index()/store()/update()/
 * destroy() en JSON, sin páginas Inertia dedicadas (ver
 * Settings/AFIP en el frontend).
 */
class TaxController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'taxes' => Tax::orderBy('rate')->get(),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        $tax = Tax::create($validated);

        return response()->json(['success' => true, 'tax' => $tax]);
    }

    public function show(Tax $tax)
    {
        //
    }

    public function edit(Tax $tax)
    {
        //
    }

    public function update(Request $request, Tax $tax): JsonResponse
    {
        $validated = $this->validated($request);

        $tax->update($validated);

        return response()->json(['success' => true, 'tax' => $tax->fresh()]);
    }

    public function destroy(Tax $tax): JsonResponse
    {
        if ($tax->products()->exists()) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar: hay productos usando esta alícuota. Desactivala en su lugar.',
            ], 422);
        }

        $tax->delete();

        return response()->json(['success' => true]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'afip_code' => ['nullable', 'string', 'max:20'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
