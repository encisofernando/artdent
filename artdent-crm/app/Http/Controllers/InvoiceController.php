<?php

namespace App\Http\Controllers;

use App\Models\Invoice;
use App\Models\InvoiceType;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Invoice::with('invoice_type');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('recipient_name', 'like', "%{$search}%")
                    ->orWhere('recipient_cuit', 'like', "%{$search}%")
                    ->orWhere('number', 'like', "%{$search}%");
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Invoice/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Invoice/Create', [
            'invoiceTypes' => InvoiceType::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'invoice_type_id' => 'required|exists:invoice_types,id',
            'recipient_name' => 'required|string|max:255',
            'recipient_cuit' => 'nullable|string|max:50',
            'recipient_iva' => 'nullable|string|max:50',
            'recipient_address' => 'nullable|string|max:255',
            'point_sale' => 'nullable|integer',
            'number' => 'nullable|integer',
            'subtotal' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'status' => 'required|string|max:50',
            'issued_at' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $validated['company_id'] = CompanyContext::id();
        $validated['user_id'] = auth()->id();

        Invoice::create($validated);

        return redirect()->route('invoices.index')->with('success', 'Factura registrada exitosamente.');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load('invoice_items', 'invoice_type', 'company');

        return Inertia::render('Invoice/Show', [
            'item' => $invoice,
        ]);
    }

    public function edit(Invoice $invoice)
    {
        return Inertia::render('Invoice/Edit', [
            'item' => $invoice,
            'invoiceTypes' => InvoiceType::all(),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'invoice_type_id' => 'required|exists:invoice_types,id',
            'recipient_name' => 'required|string|max:255',
            'recipient_cuit' => 'nullable|string|max:50',
            'recipient_iva' => 'nullable|string|max:50',
            'recipient_address' => 'nullable|string|max:255',
            'point_sale' => 'nullable|integer',
            'number' => 'nullable|integer',
            'subtotal' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total' => 'nullable|numeric|min:0',
            'status' => 'required|string|max:50',
            'issued_at' => 'nullable|date',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $invoice->update($validated);

        return redirect()->route('invoices.index')->with('success', 'Factura actualizada exitosamente.');
    }

    public function destroy(Invoice $invoice)
    {
        // Un comprobante ya autorizado por AFIP/ARCA (tiene CAE, o su
        // status ya avanzó más allá de 'draft') es un documento fiscal
        // real — borrarlo rompería el rastro de auditoría legal.
        abort_if(
            $invoice->cae || ! in_array($invoice->status, ['draft', 'failed'], true),
            422,
            'No se puede eliminar: el comprobante ya fue autorizado o está en un estado avanzado.'
        );

        $invoice->delete();

        return redirect()->route('invoices.index')->with('success', 'Factura eliminada exitosamente.');
    }
}
