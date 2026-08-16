<?php

namespace App\Http\Controllers;

use App\Models\InvoiceType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Catálogo global de tipos de comprobante (Factura A/B/C, NC, ND) —
 * invoices.invoice_type_id es NOT NULL, así que este catálogo es requisito
 * real para poder facturar, no sólo un nice-to-have. Mismo criterio de UI
 * que PaymentMethodController/TaxController: JSON sin páginas Inertia
 * dedicadas.
 */
class InvoiceTypeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'invoice_types' => InvoiceType::orderBy('afip_code')->get(),
        ]);
    }

    public function create()
    {
        //
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validated($request);

        $invoiceType = InvoiceType::create($validated);

        return response()->json(['success' => true, 'invoice_type' => $invoiceType]);
    }

    public function show(InvoiceType $invoiceType)
    {
        //
    }

    public function edit(InvoiceType $invoiceType)
    {
        //
    }

    public function update(Request $request, InvoiceType $invoiceType): JsonResponse
    {
        $validated = $this->validated($request);

        $invoiceType->update($validated);

        return response()->json(['success' => true, 'invoice_type' => $invoiceType->fresh()]);
    }

    public function destroy(InvoiceType $invoiceType): JsonResponse
    {
        if ($invoiceType->invoices()->exists()) {
            return response()->json([
                'success' => false,
                'error' => 'No se puede eliminar: hay comprobantes emitidos con este tipo. Desactivalo en su lugar.',
            ], 422);
        }

        $invoiceType->delete();

        return response()->json(['success' => true]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'afip_code' => ['required', 'string', 'max:20'],
            'is_active' => ['required', 'boolean'],
        ]);
    }
}
