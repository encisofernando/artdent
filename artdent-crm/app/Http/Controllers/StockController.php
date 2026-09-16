<?php

namespace App\Http\Controllers;

use App\Models\Category;
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
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            $stock = Stock::where('id', $stock->id)->lockForUpdate()->first();

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
            $dest = Stock::firstOrCreate(
                ['product_id' => $productId, 'variant_id' => $variantId, 'warehouse_id' => $validated['to_warehouse_id']],
                ['quantity' => 0, 'min_quantity' => 0]
            );

            // Se bloquean ambas filas en una sola query ordenada por id (no
            // por origen/destino) para que dos transferencias concurrentes en
            // direcciones opuestas (A→B y B→A) siempre las tomen en el mismo
            // orden y no se generen deadlocks.
            $locked = Stock::whereIn('id', [$origin->id, $dest->id])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');
            $origin = $locked[$origin->id];
            $dest = $locked[$dest->id];

            if ($origin->quantity < $qty) {
                throw new \RuntimeException('Stock insuficiente en el depósito origen. Disponible: '.(int) $origin->quantity);
            }

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

    /**
     * Exporta el stock valorizado filtrado como CSV (UTF-8 BOM, separador ;).
     * Filtros: warehouse_id, search, low_stock (boolean).
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $companyId = CompanyContext::id();
        $search = $request->input('search');
        $warehouseId = $request->input('warehouse_id');
        $lowStock = $request->boolean('low_stock');

        $query = Stock::query()
            ->with([
                'product:id,name,sku,cost_price,price,category_id,company_id',
                'product.category:id,name',
                'product_variant:id,sku',
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
            $query->where('min_quantity', '>', 0)
                ->whereColumn('quantity', '<=', 'min_quantity');
        }

        $stocks = $query
            ->join('products', 'stocks.product_id', '=', 'products.id')
            ->orderBy('stocks.warehouse_id')
            ->orderBy('products.name')
            ->select('stocks.*')
            ->get();

        $filename = 'stock-valorizado-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($stocks) {
            $out = fopen('php://output', 'w');
            // BOM UTF-8 para compatibilidad con Excel
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'Producto',
                'SKU',
                'Categoría',
                'Depósito',
                'Stock Actual',
                'Stock Mínimo',
                'Bajo Mínimo',
                'Costo Unitario',
                'Precio Venta',
                'Valor Stock',
            ], ';');

            foreach ($stocks as $stock) {
                $qty = (float) $stock->quantity;
                $minQty = (float) $stock->min_quantity;
                $costPrice = (float) ($stock->product?->cost_price ?? 0);
                $salePrice = (float) ($stock->product?->price ?? 0);
                $stockValue = round($qty * $costPrice, 2);
                $lowMin = ($minQty > 0 && $qty <= $minQty) ? 'Sí' : 'No';

                fputcsv($out, [
                    $stock->product?->name ?? '',
                    $stock->product?->sku ?? '',
                    $stock->product?->category?->name ?? '',
                    $stock->warehouse?->name ?? '',
                    number_format($qty, 2, ',', '.'),
                    number_format($minQty, 2, ',', '.'),
                    $lowMin,
                    number_format($costPrice, 2, ',', '.'),
                    number_format($salePrice, 2, ',', '.'),
                    number_format($stockValue, 2, ',', '.'),
                ], ';');
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    /**
     * Vista de valorización de stock con resumen (KPIs) e ítems paginados.
     * Filtros: warehouse_id, category_id, low_stock_only (boolean).
     */
    public function valuation(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $warehouseId = $request->input('warehouse_id');
        $categoryId = $request->input('category_id');
        $lowStockOnly = $request->boolean('low_stock_only');

        // ── Query base ─────────────────────────────────────────────────────────
        $baseQuery = Stock::query()
            ->with([
                'product:id,name,sku,cost_price,price,category_id,company_id',
                'product.category:id,name',
                'warehouse:id,name',
            ])
            ->whereHas('product', fn ($q) => $q->where('company_id', $companyId)->where('is_active', true));

        if ($warehouseId) {
            $baseQuery->where('warehouse_id', $warehouseId);
        }

        if ($categoryId) {
            $baseQuery->whereHas('product', fn ($q) => $q->where('category_id', $categoryId));
        }

        if ($lowStockOnly) {
            $baseQuery->where('min_quantity', '>', 0)
                ->whereColumn('quantity', '<=', 'min_quantity');
        }

        // ── KPIs de resumen ────────────────────────────────────────────────────
        // Se toma la colección completa (sin paginar) para los totales
        $all = (clone $baseQuery)
            ->join('products', 'stocks.product_id', '=', 'products.id')
            ->select('stocks.*', 'products.cost_price as _cp')
            ->get();

        $totalValue = $all->sum(fn ($s) => (float) $s->quantity * (float) ($s->_cp ?? 0));
        $totalSkus = $all->count();
        $totalUnits = $all->sum(fn ($s) => (float) $s->quantity);
        $lowStockCount = $all->filter(fn ($s) => $s->min_quantity > 0 && $s->quantity <= $s->min_quantity)->count();
        $outOfStock = $all->filter(fn ($s) => $s->quantity <= 0)->count();

        // ── Ítems paginados ────────────────────────────────────────────────────
        $paginated = $baseQuery
            ->join('products', 'stocks.product_id', '=', 'products.id')
            ->orderBy('stocks.warehouse_id')
            ->orderBy('products.name')
            ->select('stocks.*')
            ->paginate(50)
            ->withQueryString();

        $items = $paginated->through(function (Stock $stock) {
            $qty = (float) $stock->quantity;
            $minQty = (float) $stock->min_quantity;
            $costPrice = (float) ($stock->product?->cost_price ?? 0);

            if ($qty <= 0) {
                $status = 'out';
            } elseif ($minQty > 0 && $qty <= $minQty) {
                $status = 'low';
            } else {
                $status = 'ok';
            }

            return [
                'id' => $stock->id,
                'product_name' => $stock->product?->name,
                'sku' => $stock->product?->sku,
                'category_name' => $stock->product?->category?->name,
                'warehouse_name' => $stock->warehouse?->name,
                'quantity' => $qty,
                'min_quantity' => $minQty,
                'status' => $status,
                'cost_price' => $costPrice,
                'price' => (float) ($stock->product?->price ?? 0),
                'stock_value' => round($qty * $costPrice, 2),
            ];
        });

        // ── Datos para filtros ─────────────────────────────────────────────────
        $warehouses = Warehouse::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Las categorías no tienen company_id; se filtra por las que tienen productos de la empresa
        $categories = Category::whereHas('products', fn ($q) => $q->where('company_id', $companyId))
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Stock/Valuation', [
            'summary' => [
                'total_value' => round($totalValue, 2),
                'total_skus' => $totalSkus,
                'total_units' => round($totalUnits, 2),
                'low_stock_count' => $lowStockCount,
                'out_of_stock_count' => $outOfStock,
            ],
            'items' => $items,
            'warehouses' => $warehouses,
            'categories' => $categories,
            'filters' => [
                'warehouse_id' => $warehouseId,
                'category_id' => $categoryId,
                'low_stock_only' => $lowStockOnly,
            ],
        ]);
    }
}
