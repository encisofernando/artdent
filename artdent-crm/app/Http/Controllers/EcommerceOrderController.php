<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\Stock;
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
            'customer',
            'coupon',
            'ecommerce_order_items.product.product_images',
        ]);

        return Inertia::render('EcommerceOrder/Show', [
            'order' => $ecommerceOrder,
        ]);
    }

    public function update(Request $request, EcommerceOrder $ecommerceOrder)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'admin_notes' => 'nullable|string|max:2000',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:500',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_province' => 'nullable|string|max:100',
            'shipping_postal' => 'nullable|string|max:20',
            'shipping_phone' => 'nullable|string|max:30',
        ]);

        $previousStatus = $ecommerceOrder->status;
        $newStatus = $validated['status'] ?? $previousStatus;
        $terminalStatuses = ['cancelled', 'refunded'];
        $wasTerminal = in_array($previousStatus, $terminalStatuses);
        $becomesTerminal = in_array($newStatus, $terminalStatuses);

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
            }
        }

        $ecommerceOrder->update($validated);

        return back()->with('success', 'Pedido actualizado.');
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
