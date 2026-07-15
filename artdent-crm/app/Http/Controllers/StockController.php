<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Services\StockAlertService;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StockController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $search = $request->input('search');
        $warehouseId = $request->input('warehouse_id');
        $lowStock = $request->boolean('low_stock');

        $query = Stock::query()
            ->with([
                'product:id,name,sku,cost_price,min_stock,has_variants',
                'product_variant:id,sku,barcode',
                'warehouse:id,name',
            ])
            ->whereHas('product', fn ($q) => $q->where('company_id', $companyId)->where('is_active', true));

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($lowStock) {
            $query->whereHas('product', fn ($q) => $q->whereNotNull('min_stock')->where('min_stock', '>', 0))
                ->whereColumn('quantity', '<=', 'products.min_stock');
        }

        $items = $query->join('products', 'stocks.product_id', '=', 'products.id')
            ->orderBy('stocks.warehouse_id')
            ->orderBy('products.name')
            ->select('stocks.*')
            ->paginate(50)
            ->withQueryString();

        $warehouses = Warehouse::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'has_variants', 'min_stock']);

        return Inertia::render('Stock/Index', [
            'items' => $items,
            'warehouses' => $warehouses,
            'products' => $products,
            'filters' => [
                'search' => $search,
                'warehouse_id' => $warehouseId,
                'low_stock' => $lowStock,
            ],
        ]);
    }

    public function adjust(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'qty' => ['required', 'numeric', 'not_in:0'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($validated) {
            $stock = Stock::firstOrCreate(
                [
                    'product_id' => $validated['product_id'],
                    'variant_id' => $validated['variant_id'] ?? null,
                    'warehouse_id' => $validated['warehouse_id'],
                ],
                ['quantity' => 0, 'min_quantity' => 0]
            );

            $qty = (float) $validated['qty'];
            $before = (float) $stock->quantity;
            $stock->quantity = max(0, $before + $qty);
            $stock->save();

            StockMovement::create([
                'product_id' => $validated['product_id'],
                'variant_id' => $validated['variant_id'] ?? null,
                'warehouse_id' => $validated['warehouse_id'],
                'user_id' => auth()->id(),
                'type' => 'adjustment',
                'quantity' => abs($qty),
                'stock_before' => $before,
                'stock_after' => $stock->quantity,
                'reference_type' => 'manual',
                'note' => $validated['note'] ?? ($qty > 0 ? 'Ajuste positivo manual' : 'Ajuste negativo manual'),
                'created_at' => now(),
            ]);

            StockAlertService::checkAndNotify(
                $validated['product_id'],
                $validated['variant_id'] ?? null,
                $validated['warehouse_id']
            );
        });

        return back()->with('success', 'Ajuste de stock registrado.');
    }

    public function transfer(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'from_warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'to_warehouse_id' => ['required', 'integer', 'exists:warehouses,id', 'different:from_warehouse_id'],
            'qty' => ['required', 'numeric', 'min:0.001'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $productId = $validated['product_id'];
        $variantId = $validated['variant_id'] ?? null;
        $qty = (float) $validated['qty'];

        DB::transaction(function () use ($validated, $productId, $variantId, $qty) {
            $origin = Stock::firstOrCreate(
                ['product_id' => $productId, 'variant_id' => $variantId, 'warehouse_id' => $validated['from_warehouse_id']],
                ['quantity' => 0, 'min_quantity' => 0]
            );

            if ($origin->quantity < $qty) {
                throw new \RuntimeException('Stock insuficiente en el depósito origen. Disponible: '.(int) $origin->quantity);
            }

            $dest = Stock::firstOrCreate(
                ['product_id' => $productId, 'variant_id' => $variantId, 'warehouse_id' => $validated['to_warehouse_id']],
                ['quantity' => 0, 'min_quantity' => 0]
            );

            $beforeOrigin = $origin->quantity;
            $origin->quantity -= $qty;
            $origin->save();

            $beforeDest = $dest->quantity;
            $dest->quantity += $qty;
            $dest->save();

            $note = $validated['note'] ?? null;

            StockMovement::create([
                'product_id' => $productId,
                'variant_id' => $variantId,
                'warehouse_id' => $validated['from_warehouse_id'],
                'user_id' => auth()->id(),
                'type' => 'transfer_out',
                'quantity' => $qty,
                'stock_before' => $beforeOrigin,
                'stock_after' => $origin->quantity,
                'reference_type' => 'transfer',
                'reference_id' => $validated['to_warehouse_id'],
                'note' => $note ?? 'Transferencia saliente',
                'created_at' => now(),
            ]);

            StockMovement::create([
                'product_id' => $productId,
                'variant_id' => $variantId,
                'warehouse_id' => $validated['to_warehouse_id'],
                'user_id' => auth()->id(),
                'type' => 'transfer_in',
                'quantity' => $qty,
                'stock_before' => $beforeDest,
                'stock_after' => $dest->quantity,
                'reference_type' => 'transfer',
                'reference_id' => $validated['from_warehouse_id'],
                'note' => $note ?? 'Transferencia entrante',
                'created_at' => now(),
            ]);

            StockAlertService::checkAndNotify($productId, $variantId, $validated['from_warehouse_id']);
        });

        return back()->with('success', 'Transferencia registrada correctamente.');
    }
}
