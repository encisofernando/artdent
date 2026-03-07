<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
use App\Models\PaymentMethod;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SaleController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Sale::with('sale_items')
            ->where('company_id', auth()->user()->company_id ?? 1);

        if ($search) {
            $query->where('sale_number', 'like', "%{$search}%");
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('id')->paginate(20)->withQueryString();

        if ($request->wantsJson()) {
            return response()->json(['items' => $items]);
        }

        return Inertia::render('Sale/Index', [
            'items'   => $items,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    public function create()
    {
        $products = Product::with('product_images')
            ->where('is_active', 1)
            ->get(['id', 'name', 'sku', 'price', 'cost_price', 'tax_rate', 'track_stock', 'has_variants']);

        return Inertia::render('Sale/Create', [
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items'              => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity'   => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount'   => 'nullable|numeric|min:0',
            'items.*.total'      => 'required|numeric|min:0',
            'subtotal'           => 'nullable|numeric',
            'discount_amount'    => 'nullable|numeric',
            'tax_amount'         => 'nullable|numeric',
            'total'              => 'required|numeric|min:0',
            'paid_amount'        => 'required|numeric|min:0',
            'payment_method'     => 'nullable|string',
            'receipt_type'       => 'nullable|string',
            'notes'              => 'nullable|string',
            'customer_name'      => 'nullable|string',
        ]);

        $companyId = auth()->user()->company_id ?? 1;
        $userId    = auth()->id();

        $warehouse = Warehouse::firstOrCreate(
            ['company_id' => $companyId],
            ['name' => 'Depósito Principal', 'code' => 'DEP-01', 'is_active' => true]
        );

        // ── Número de comprobante formato 00001-00000001 ──────────────────────
        $receiptType = strtoupper($request->receipt_type ?? 'X');
        $company     = \App\Models\Company::find($companyId);

        // X → punto de venta fijo 00001 | A/B/C → companies.afip_point_sale
        $pointSale = in_array($receiptType, ['A', 'B', 'C'])
            ? str_pad($company?->afip_point_sale ?? 1, 5, '0', STR_PAD_LEFT)
            : '00001';

        $sequence   = Sale::where('company_id', $companyId)
                          ->where('receipt_type', $receiptType)
                          ->count() + 1;
        $saleNumber = $pointSale . '-' . str_pad($sequence, 8, '0', STR_PAD_LEFT);
        // ─────────────────────────────────────────────────────────────────────

        $paidAmount = (float) $request->paid_amount;
        $total      = (float) $request->total;
        $change     = max(0, $paidAmount - $total);

        $notes = $request->notes ?? '';
        if (!empty($request->customer_name) && $request->customer_name !== 'Consumidor Final') {
            $notes = 'Cliente: ' . $request->customer_name . ($notes ? "\n" . $notes : '');
        }

        DB::beginTransaction();
        try {
            $sale = Sale::create([
                'company_id'      => $companyId,
                'user_id'         => $userId,
                'sale_number'     => $saleNumber,
                'receipt_type'    => $receiptType,
                'status'          => 'completed',
                'subtotal'        => $request->subtotal        ?? 0,
                'discount_amount' => $request->discount_amount ?? 0,
                'tax_amount'      => $request->tax_amount      ?? 0,
                'total'           => $total,
                'paid_amount'     => $paidAmount,
                'change_amount'   => $change,
                'notes'           => $notes,
                'sold_at'         => now(),
            ]);

            // Registrar método de pago
            $pm = PaymentMethod::where('name', $request->payment_method)
                ->orWhere('type', $request->payment_method)
                ->first();
            SalePayment::create([
                'sale_id'           => $sale->id,
                'payment_method_id' => $pm?->id ?? null,
                'amount'            => $paidAmount,
                'paid_at'           => now(),
            ]);

            // Crear ítems y descontar stock
            foreach ($request->items as $item) {
                $qty       = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $discount  = (float) ($item['discount'] ?? 0);
                $lineTotal = (float) $item['total'];
                $taxAmount = isset($item['tax_rate']) && $item['tax_rate'] > 0
                    ? round($lineTotal - ($lineTotal / (1 + $item['tax_rate'])), 2)
                    : 0;

                $product = Product::find($item['product_id']);

                SaleItem::create([
                    'sale_id'      => $sale->id,
                    'product_id'   => $item['product_id'],
                    'product_name' => $item['name'] ?? ($product->name ?? 'Producto'),
                    'sku'          => $product->sku ?? null,
                    'quantity'     => $qty,
                    'unit_price'   => $unitPrice,
                    'discount'     => $discount,
                    'tax_amount'   => $taxAmount,
                    'total'        => $lineTotal,
                ]);

                if ($product && $product->track_stock) {
                    $stock = Stock::firstOrCreate(
                        ['product_id' => $item['product_id'], 'warehouse_id' => $warehouse->id],
                        ['quantity' => 0]
                    );

                    $stockBefore = (float) $stock->quantity;
                    $stockAfter  = $stockBefore - $qty;

                    $stock->update(['quantity' => $stockAfter]);

                    StockMovement::create([
                        'product_id'     => $item['product_id'],
                        'warehouse_id'   => $warehouse->id,
                        'user_id'        => $userId,
                        'type'           => 'out',
                        'quantity'       => $qty,
                        'stock_before'   => $stockBefore,
                        'stock_after'    => $stockAfter,
                        'reference_type' => 'sale',
                        'reference_id'   => $sale->id,
                        'note'           => "Venta POS {$saleNumber}",
                    ]);
                }
            }

            DB::commit();

            return redirect()
                ->route('sales.show', $sale->id)
                ->with('success', "Venta {$saleNumber} registrada correctamente.");

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('SaleController@store error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    /**
     * Detalle de venta (Show Inertia)
     */
    public function show(Sale $sale)
    {
        // Todas las relaciones ya están definidas en el modelo Sale
        $sale->load([
            'sale_items',
            'sale_payments.paymentMethod',
            'company',
            'user',
        ]);

        return Inertia::render('Sale/Show', [
            'sale' => array_merge($sale->toArray(), [
                // Normalizar sale_payments para el frontend: { amount, payment_method: { name, type } }
                'sale_payments' => $sale->sale_payments->map(fn($p) => [
                    'amount'         => $p->amount,
                    'payment_method' => $p->paymentMethod
                        ? ['name' => $p->paymentMethod->name, 'type' => $p->paymentMethod->type]
                        : null,
                ]),
            ]),
        ]);
    }

    public function destroy(Sale $sale)
    {
        if ($sale->status === 'cancelled') {
            return back()->withErrors(['error' => 'La venta ya está cancelada.']);
        }

        $companyId = auth()->user()->company_id ?? 1;
        $warehouse = Warehouse::where('company_id', $companyId)->first();

        DB::beginTransaction();
        try {
            if ($warehouse) {
                foreach ($sale->sale_items as $item) {
                    $product = Product::find($item->product_id);

                    if ($product && $product->track_stock) {
                        $stock = Stock::firstOrCreate(
                            ['product_id' => $item->product_id, 'warehouse_id' => $warehouse->id],
                            ['quantity' => 0]
                        );

                        $stockBefore = (float) $stock->quantity;
                        $stockAfter  = $stockBefore + $item->quantity;

                        $stock->update(['quantity' => $stockAfter]);

                        StockMovement::create([
                            'product_id'     => $item->product_id,
                            'warehouse_id'   => $warehouse->id,
                            'user_id'        => auth()->id(),
                            'type'           => 'in',
                            'quantity'       => $item->quantity,
                            'stock_before'   => $stockBefore,
                            'stock_after'    => $stockAfter,
                            'reference_type' => 'sale_cancellation',
                            'reference_id'   => $sale->id,
                            'note'           => "Cancelación venta {$sale->sale_number}",
                        ]);
                    }
                }
            }

            $sale->update(['status' => 'cancelled']);
            DB::commit();

            return redirect()
                ->route('sales.index')
                ->with('success', "Venta {$sale->sale_number} cancelada.");

        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Error al cancelar: ' . $e->getMessage()]);
        }
    }
}