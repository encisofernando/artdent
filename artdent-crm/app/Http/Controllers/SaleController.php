<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\SalePayment;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all'); // 'all', 'draft', 'confirmed', 'invoiced', 'paid', 'cancelled'
        $source = $request->input('source', 'all'); // 'all', 'pos', 'ecom'
        $from = $request->input('from');
        $to = $request->input('to');

        // Note: For now we'll pretend there's a 'source' column or filter based on other logic, 
        // since the old UI had POS vs Ecom. Let's assume there's a 'sale_number' and 'status' in DB.
        $query = Sale::with(['cash_session', 'sale_items', 'sale_items.product']);

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('sale_number', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%");
                // In a real scenario we'd join with 'companies' or 'customers' to search by name too
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($from) {
            $query->whereDate('sold_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('sold_at', '<=', $to);
        }

        $items = $query->orderBy('sold_at', 'desc')->paginate(20)->withQueryString();

        return Inertia::render('Sale/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'source' => $source,
                'from' => $from,
                'to' => $to,
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        // For the POS (Point of Sale) view
        // We might want to pass available products here natively
        $products = \App\Models\Product::where('is_active', 1)->get();
        return Inertia::render('Sale/Create', [
            'products' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string',
            'notes' => 'nullable|string',
            'subtotal' => 'required|numeric',
            'discount_amount' => 'required|numeric',
            'tax_amount' => 'required|numeric',
            'total' => 'required|numeric',
            'paid_amount' => 'required|numeric',
            'payment_method' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.name' => 'required|string',
            'items.*.unit_price' => 'required|numeric',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.discount' => 'required|numeric',
            'items.*.total' => 'required|numeric',
        ]);

        \DB::beginTransaction();

        try {
            $companyId = auth()->user()->company_id ?? 1;
            
            // Create the Sale record
            $sale = Sale::create([
                'company_id' => $companyId,
                'user_id' => auth()->id(),
                'status' => 'paid',
                'sale_number' => 'VNT-' . date('Ymd-His'), // Simple auto-generation
                'subtotal' => $validated['subtotal'],
                'discount_amount' => $validated['discount_amount'],
                'tax_amount' => $validated['tax_amount'],
                'total' => $validated['total'],
                'paid_amount' => $validated['paid_amount'],
                'change_amount' => max(0, $validated['paid_amount'] - $validated['total']),
                'notes' => $validated['notes'],
                'sold_at' => now(),
            ]);

            // Default warehouse for this company (using an arbitrary logic or 1 for now)
            $warehouseId = \App\Models\Warehouse::where('company_id', $companyId)->value('id') ?? 1;

            // Create Sale Items & Deduct Stock
            foreach ($validated['items'] as $item) {
                \App\Models\SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['name'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'discount' => $item['discount'],
                    'tax_amount' => 0, // Simplified for now
                    'total' => $item['total'],
                ]);

                // Adjust Stock
                $product = \App\Models\Product::find($item['product_id']);
                if ($product && $product->track_stock) {
                    $stock = Stock::firstOrCreate(
                        ['product_id' => $product->id, 'warehouse_id' => $warehouseId],
                        ['quantity' => 0]
                    );

                    $stockBefore = $stock->quantity;
                    $stock->decrement('quantity', $item['quantity']);
                    $stockAfter = $stockBefore - $item['quantity'];

                    StockMovement::create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouseId,
                        'user_id' => auth()->id(),
                        'type' => 'sale', // Type sale deducts
                        'quantity' => -$item['quantity'],
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'App\Models\Sale',
                        'reference_id' => $sale->id,
                        'note' => 'Venta POS ' . $sale->sale_number
                    ]);
                }
            }

            // Record Payment
            if ($validated['paid_amount'] > 0) {
                // Determine payment method, hardcode mapping or allow null
                $methodName = $validated['payment_method'] ?? 'cash';
                $pm = \App\Models\PaymentMethod::where('company_id', $companyId)->where('name', 'like', "%{$methodName}%")->first();
                
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'payment_method_id' => $pm ? $pm->id : null, 
                    'amount' => $validated['total'], // we only record the exact total paid, not the extra change
                    'paid_at' => now()
                ]);
            }

            \DB::commit();

            // Return to POS with success and passing the new sale ID so frontend could open a ticket
            return redirect()->route('sales.create')->with([
                'success' => 'Venta ' . $sale->sale_number . ' registrada correctamente.',
                'ticket_sale_id' => $sale->id
            ]);
        } catch (\Exception $e) {
            \DB::rollBack();
            return back()->withErrors(['error' => 'Error al registrar la venta: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $sale->load(['sale_items', 'sale_items.product']);
        return Inertia::render('Sale/Show', [
            'sale' => $sale
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Sale $sale)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        //
    }
}
