<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentMethodController extends Controller
{
    private const TYPES = ['cash', 'card_debit', 'card_credit', 'transfer', 'mp', 'check', 'other'];

    private const APPLIES_TO = ['ecommerce', 'pos', 'lab'];

    public function index(): JsonResponse
    {
        return response()->json([
            'payment_methods' => PaymentMethod::orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        PaymentMethod::create($validated);

        return response()->json(['success' => true, 'message' => 'Medio de pago creado.']);
    }

    public function show(PaymentMethod $paymentMethod)
    {
        //
    }

    public function edit(PaymentMethod $paymentMethod)
    {
        //
    }

    public function update(Request $request, PaymentMethod $paymentMethod): JsonResponse
    {
        $validated = $this->validated($request);

        $paymentMethod->update($validated);

        return response()->json(['success' => true, 'message' => 'Medio de pago actualizado.']);
    }

    public function destroy(PaymentMethod $paymentMethod): JsonResponse
    {
        $inUse = $paymentMethod->sale_payments()->exists()
            || $paymentMethod->cash_movements()->exists()
            || $paymentMethod->expenses()->exists()
            || $paymentMethod->lab_account_moves()->exists()
            || $paymentMethod->collaborator_receipts()->exists();

        if ($inUse) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar: ya tiene ventas, movimientos de caja u otros registros asociados. Desactivalo en su lugar.',
            ], 422);
        }

        $paymentMethod->delete();

        return response()->json(['success' => true, 'message' => 'Medio de pago eliminado.']);
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'type' => ['nullable', Rule::in(self::TYPES)],
            'surcharge_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_active' => ['required', 'boolean'],
            'applies_to' => ['nullable', 'array'],
            'applies_to.*' => [Rule::in(self::APPLIES_TO)],
        ]);

        $validated['applies_to'] = ! empty($validated['applies_to'])
            ? implode(',', $validated['applies_to'])
            : null;

        return $validated;
    }
}
