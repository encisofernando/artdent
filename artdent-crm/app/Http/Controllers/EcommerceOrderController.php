<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateEcommerceAfipCreditNoteJob;
use App\Jobs\GenerateEcommerceAfipInvoiceJob;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\Invoice;
use App\Models\Stock;
use App\Services\MercadoPagoRefundService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EcommerceOrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $payment = $request->input('payment', 'all');

        $query = EcommerceOrder::query()
            ->with(['customer', 'coupon'])
            ->withCount('ecommerce_order_items');

        if ($search) {
            $query->where(function ($q) use ($search): void {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($payment !== 'all') {
            $query->where('payment_status', $payment);
        }

        $items = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        // KPIs globales sobre la consulta filtrada (sin paginación)
        // Excluye cancelados/reembolsados del facturado y por cobrar
        $activeQuery = EcommerceOrder::query()
            ->whereNotIn('status', ['cancelled', 'refunded']);

        // Aplicar los mismos filtros de búsqueda al query de KPIs
        if ($search) {
            $activeQuery->where(function ($q) use ($search): void {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $kpis = [
            'total_orders' => $items->total(),
            'total_billed' => (float) (clone $activeQuery)->sum('total'),
            'total_paid' => (float) (clone $activeQuery)->where('payment_status', 'paid')->sum('total'),
            'total_pending' => (float) (clone $activeQuery)->where('payment_status', 'pending')->sum('total'),
        ];

        return Inertia::render('EcommerceOrder/Index', [
            'items' => $items,
            'filters' => compact('search', 'status', 'payment'),
            'kpis' => $kpis,
        ]);
    }

    public function show(EcommerceOrder $ecommerceOrder)
    {
        $ecommerceOrder->load([
            'company',
            'customer',
            'coupon',
            'ecommerce_order_items.product.product_images',
            'shipments',
        ]);

        $invoice = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $ecommerceOrder->id)
            ->with('invoice_type')
            ->first();

        return Inertia::render('EcommerceOrder/Show', [
            'order' => $ecommerceOrder,
            'invoice' => $invoice,
        ]);
    }

    public function update(Request $request, EcommerceOrder $ecommerceOrder)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded,refund_failed',
            'admin_notes' => 'nullable|string|max:2000',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:500',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_province' => 'nullable|string|max:100',
            'shipping_postal' => 'nullable|string|max:20',
            'shipping_phone' => 'nullable|string|max:30',
            'carrier' => 'nullable|string|max:100',
            'tracking_code' => 'nullable|string|max:255',
            'tracking_url' => 'nullable|url|max:500',
            'tracking_status' => 'nullable|in:preparing,shipped,in_transit,delivered,returned',
            'shipped_at' => 'nullable|date',
            'estimated_delivery' => 'nullable|date',
            'delivered_at' => 'nullable|date',
            'tracking_notes' => 'nullable|string|max:500',
        ]);

        $previousStatus = $ecommerceOrder->status;
        $newStatus = $validated['status'] ?? $previousStatus;
        $terminalStatuses = ['cancelled', 'refunded'];
        $wasTerminal = in_array($previousStatus, $terminalStatuses);
        $becomesTerminal = in_array($newStatus, $terminalStatuses);

        // Si cancela/reembolsa por primera vez y tiene factura AFIP, generar NC automáticamente
        $shouldGenerateCreditNote = $becomesTerminal && ! $wasTerminal
            && Invoice::query()
                ->where('reference_type', EcommerceOrder::class)
                ->where('reference_id', $ecommerceOrder->id)
                ->whereNotNull('cae')
                ->exists();

        // Return stock when transitioning to cancelled/refunded for the first time
        if ($becomesTerminal && ! $wasTerminal) {
            $warehouseId = (int) env('ECOMMERCE_WAREHOUSE_ID', 1);
            $ecommerceOrder->load('ecommerce_order_items');

            foreach ($ecommerceOrder->ecommerce_order_items as $item) {
                Stock::query()
                    ->where('product_id', $item->product_id)
                    ->where('warehouse_id', $warehouseId)
                    ->when(
                        $item->variant_id === null,
                        fn ($q) => $q->whereNull('variant_id'),
                        fn ($q) => $q->where('variant_id', $item->variant_id)
                    )
                    ->increment('quantity', $item->quantity);
            }

            // Cancel pending payment automatically
            if ($ecommerceOrder->payment_status === 'pending') {
                $validated['payment_status'] = 'failed';
            } elseif ($ecommerceOrder->payment_status === 'paid') {
                $refunded = app(MercadoPagoRefundService::class)->refund($ecommerceOrder);

                if ($refunded) {
                    $validated['payment_status'] = 'refunded';
                    $validated['status'] = 'refunded';
                } else {
                    CrmNotification::create([
                        'type' => 'refund_failed',
                        'title' => 'Reembolso fallido',
                        'body' => "No se pudo reembolsar el pedido #{$ecommerceOrder->order_number}. Revisar manualmente en MercadoPago.",
                        'url' => '/ecommerce-orders/'.$ecommerceOrder->id,
                        'order_code' => $ecommerceOrder->order_number,
                    ]);
                }
            }
        }

        $previousPaymentStatus = $ecommerceOrder->payment_status;

        $ecommerceOrder->update($validated);

        // Disparar factura AFIP cuando el pago se confirma manualmente
        if (($validated['payment_status'] ?? null) === 'paid' && $previousPaymentStatus !== 'paid') {
            $hasInvoice = Invoice::query()
                ->where('reference_type', EcommerceOrder::class)
                ->where('reference_id', $ecommerceOrder->id)
                ->whereNotNull('cae')
                ->exists();

            if (! $hasInvoice) {
                try {
                    GenerateEcommerceAfipInvoiceJob::dispatch($ecommerceOrder->id);
                } catch (\Throwable) {
                    // El job loguea el error internamente; no bloqueamos la actualización
                }
            }
        }

        // Disparar NC AFIP cuando se cancela/reembolsa un pedido con factura autorizada
        if ($shouldGenerateCreditNote) {
            try {
                GenerateEcommerceAfipCreditNoteJob::dispatch($ecommerceOrder->id);
            } catch (\Throwable) {
                // El job loguea el error y genera notificación CRM; no bloqueamos la actualización
            }
        }

        // Handle shipment tracking
        $trackingData = array_filter([
            'carrier' => $request->input('carrier'),
            'tracking_code' => $request->input('tracking_code'),
            'tracking_url' => $request->input('tracking_url'),
            'status' => $request->input('tracking_status'),
            'shipped_at' => $request->input('shipped_at') ?: null,
            'estimated_delivery' => $request->input('estimated_delivery') ?: null,
            'delivered_at' => $request->input('delivered_at') ?: null,
            'notes' => $request->input('tracking_notes'),
        ], fn ($v) => $v !== null && $v !== '');

        if (! empty($trackingData)) {
            $shipment = $ecommerceOrder->shipments()->first();
            if ($shipment) {
                $shipment->update($trackingData);
            } else {
                $ecommerceOrder->shipments()->create($trackingData);
            }
        }

        return back()->with('success', 'Pedido actualizado.');
    }

    public function generateInvoice(EcommerceOrder $ecommerceOrder)
    {
        if ($ecommerceOrder->payment_status !== 'paid') {
            return back()->withErrors(['error' => 'Solo se puede facturar pedidos con pago confirmado.']);
        }

        $hasInvoice = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $ecommerceOrder->id)
            ->whereNotNull('cae')
            ->exists();

        if ($hasInvoice) {
            return back()->withErrors(['error' => 'El pedido ya tiene comprobante AFIP autorizado.']);
        }

        try {
            GenerateEcommerceAfipInvoiceJob::dispatch($ecommerceOrder->id);
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => 'Error AFIP: '.$e->getMessage()]);
        }

        return back()->with('success', 'Comprobante AFIP en proceso. Se enviará por email al cliente.');
    }

    public function destroy(EcommerceOrder $ecommerceOrder)
    {
        $ecommerceOrder->delete();

        return redirect()->route('ecommerce-orders.index')->with('success', 'Pedido eliminado.');
    }

    // Kept for route completeness — not used
    public function create()
    {
        return redirect()->route('ecommerce-orders.index');
    }

    public function store(Request $request)
    {
        return redirect()->route('ecommerce-orders.index');
    }

    public function edit(EcommerceOrder $ecommerceOrder)
    {
        return redirect()->route('ecommerce-orders.show', $ecommerceOrder);
    }
}
