<?php

namespace App\Http\Controllers;

use App\Models\HeldSale;
use App\Support\CompanyContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HeldSaleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = CompanyContext::id();

        $items = HeldSale::where('company_id', $companyId)
            ->with('user:id,name')
            ->latest()
            ->get(['id', 'user_id', 'label', 'created_at']);

        return response()->json(['items' => $items]);
    }

    public function store(Request $request): JsonResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:100'],
            'cart_data' => ['required', 'array'],
        ]);

        $held = HeldSale::create([
            'company_id' => $companyId,
            'user_id' => $request->user()->id,
            'label' => $validated['label'] ?? null,
            'cart_data' => $validated['cart_data'],
        ]);

        return response()->json(['id' => $held->id]);
    }

    public function show(HeldSale $heldSale): JsonResponse
    {
        abort_unless($heldSale->company_id === (CompanyContext::id()), 404);

        return response()->json(['cart_data' => $heldSale->cart_data]);
    }

    public function destroy(HeldSale $heldSale): JsonResponse
    {
        abort_unless($heldSale->company_id === (CompanyContext::id()), 404);

        $heldSale->delete();

        return response()->json(['success' => true]);
    }
}
