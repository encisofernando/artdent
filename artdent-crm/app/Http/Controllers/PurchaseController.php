<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Vendor;
use App\Models\VendorAccount;
use App\Models\VendorAccountMove;
use App\Models\Warehouse;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $search = $request->input('search');
        $vendorId = $request->input('vendor_id');
        $status = $request->input('status', 'all');
        $companyId = CompanyContext::id();

        $query = Purchase::query()
            ->with(['vendor', 'user'])
            ->where('company_id', $companyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                    ->orWhere('invoice_number', 'like', "%{$search}%")
                    ->orWhere('cae', 'like', "%{$search}%")
                    ->orWhereHas('vendor', fn ($v) => $v->where('name', 'like', "%{$search}%"));
            });
        }

        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderBy('purchased_at', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $vendors = Vendor::where('company_id', $companyId)
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Purchase/Index', [
            'items' => $items,
            'vendors' => $vendors,
            'filters' => [
                'search' => $search,
                'vendor_id' => $vendorId,
                'status' => $status,
            ],
        ]);
    }

    public function create(): \Inertia\Response
    {
        $companyId = CompanyContext::id();

        $vendors = Vendor::where('company_id', $companyId)
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'name', 'cuit', 'iva_condition']);

        $warehouses = Warehouse::where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $products = Product::where('company_id', $companyId)
            ->where('is_active', 1)
            ->with(['product_variants' => fn ($q) => $q->select('id', 'product_id', 'sku', 'barcode')->where('is_active', 1)])
            ->orderBy('name')
            ->get(['id', 'name', 'sku', 'cost_price', 'price', 'has_variants']);

        return Inertia::render('Purchase/Create', [
            'vendors' => $vendors,
            'warehouses' => $warehouses,
            'products' => $products,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'invoice_type' => 'nullable|string|max:10',
            'invoice_number' => 'nullable|string|max:50',
            'cae' => 'nullable|string|max:20',
            'cae_due_date' => 'nullable|date',
            'reference_no' => 'nullable|string|max:100',
            'status' => 'required|in:pending,received,partial,cancelled',
            'purchased_at' => 'required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.new_price' => 'nullable|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
        ]);

        $companyId = CompanyContext::id();

        DB::transaction(function () use ($validated, $companyId) {
            $purchase = Purchase::create([
                'company_id' => $companyId,
                'vendor_id' => $validated['vendor_id'],
                'user_id' => auth()->id(),
                'warehouse_id' => $validated['warehouse_id'],
                'invoice_type' => $validated['invoice_type'] ?? null,
                'invoice_number' => $validated['invoice_number'] ?? null,
                'cae' => $validated['cae'] ?? null,
                'cae_due_date' => $validated['cae_due_date'] ?? null,
                'reference_no' => $validated['reference_no'] ?? null,
                'status' => $validated['status'],
                'purchased_at' => $validated['purchased_at'],
                'due_date' => $validated['due_date'] ?? null,
                'subtotal' => $validated['subtotal'],
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'total' => $validated['total'],
                'notes' => $validated['notes'] ?? null,
            ]);

            foreach ($validated['items'] as $itemData) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $itemData['product_id'],
                    'variant_id' => $itemData['variant_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_cost' => $itemData['unit_cost'],
                    'total' => $itemData['total'],
                    'received_qty' => $validated['status'] === 'received' ? $itemData['quantity'] : 0,
                ]);

                // Actualizar stock sólo si el comprobante está recibido
                if (in_array($validated['status'], ['received', 'partial'])) {
                    $this->updateStock(
                        $itemData['product_id'],
                        $itemData['variant_id'] ?? null,
                        $validated['warehouse_id'],
                        $itemData['quantity'],
                        $purchase->id
                    );
                }

                // Actualizar cost_price y price del producto si se proveyó nuevo precio
                if (! empty($itemData['new_price']) && $itemData['new_price'] > 0) {
                    Product::where('id', $itemData['product_id'])->update([
                        'cost_price' => $itemData['unit_cost'],
                        'price' => $itemData['new_price'],
                    ]);
                }
            }

            // Actualizar cuenta corriente del proveedor
            $this->debitVendorAccount($purchase, $companyId);
        });

        return redirect()->route('proveedores.comprobantes.index')
            ->with('success', 'Comprobante registrado exitosamente.');
    }

    public function show(Purchase $purchase): \Inertia\Response
    {
        $purchase->load([
            'vendor',
            'warehouse',
            'user',
            'purchase_items.product',
            'purchase_items.product.product_images',
        ]);

        return Inertia::render('Purchase/Show', [
            'purchase' => $purchase,
        ]);
    }

    public function edit(Purchase $purchase): \Inertia\Response
    {
        $companyId = CompanyContext::id();

        $purchase->load(['purchase_items.product', 'purchase_items.product.product_variants']);

        $vendors = Vendor::where('company_id', $companyId)->where('is_active', 1)->orderBy('name')->get(['id', 'name']);
        $warehouses = Warehouse::where('company_id', $companyId)->orderBy('name')->get(['id', 'name']);
        $products = Product::where('company_id', $companyId)->where('is_active', 1)
            ->with(['product_variants' => fn ($q) => $q->select('id', 'product_id', 'sku', 'barcode')->where('is_active', 1)])
            ->orderBy('name')->get(['id', 'name', 'sku', 'cost_price', 'has_variants']);

        return Inertia::render('Purchase/Edit', [
            'purchase' => $purchase,
            'vendors' => $vendors,
            'warehouses' => $warehouses,
            'products' => $products,
        ]);
    }

    public function update(Request $request, Purchase $purchase): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'invoice_type' => 'nullable|string|max:10',
            'invoice_number' => 'nullable|string|max:50',
            'cae' => 'nullable|string|max:20',
            'cae_due_date' => 'nullable|date',
            'reference_no' => 'nullable|string|max:100',
            'status' => 'required|in:pending,received,partial,cancelled',
            'purchased_at' => 'required|date',
            'due_date' => 'nullable|date',
            'subtotal' => 'required|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
        ]);

        $companyId = CompanyContext::id();
        $previousStatus = $purchase->status;

        DB::transaction(function () use ($validated, $purchase, $previousStatus, $companyId) {
            $purchase->update([
                'vendor_id' => $validated['vendor_id'],
                'warehouse_id' => $validated['warehouse_id'],
                'invoice_type' => $validated['invoice_type'] ?? null,
                'invoice_number' => $validated['invoice_number'] ?? null,
                'cae' => $validated['cae'] ?? null,
                'cae_due_date' => $validated['cae_due_date'] ?? null,
                'reference_no' => $validated['reference_no'] ?? null,
                'status' => $validated['status'],
                'purchased_at' => $validated['purchased_at'],
                'due_date' => $validated['due_date'] ?? null,
                'subtotal' => $validated['subtotal'],
                'tax_amount' => $validated['tax_amount'] ?? 0,
                'total' => $validated['total'],
                'notes' => $validated['notes'] ?? null,
            ]);

            // Revertir stock del estado anterior si estaba recibido
            if (in_array($previousStatus, ['received', 'partial'])) {
                foreach ($purchase->purchase_items as $oldItem) {
                    $this->updateStock(
                        $oldItem->product_id,
                        $oldItem->variant_id,
                        $purchase->warehouse_id,
                        -$oldItem->received_qty,
                        $purchase->id
                    );
                }
            }

            $purchase->purchase_items()->delete();

            foreach ($validated['items'] as $itemData) {
                PurchaseItem::create([
                    'purchase_id' => $purchase->id,
                    'product_id' => $itemData['product_id'],
                    'variant_id' => $itemData['variant_id'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_cost' => $itemData['unit_cost'],
                    'total' => $itemData['total'],
                    'received_qty' => $validated['status'] === 'received' ? $itemData['quantity'] : 0,
                ]);

                if (in_array($validated['status'], ['received', 'partial'])) {
                    $this->updateStock(
                        $itemData['product_id'],
                        $itemData['variant_id'] ?? null,
                        $validated['warehouse_id'],
                        $itemData['quantity'],
                        $purchase->id
                    );
                }
            }

            // Recalcular cuenta corriente
            $account = VendorAccount::firstOrCreate(
                ['vendor_id' => $purchase->vendor_id],
                ['company_id' => $companyId, 'balance' => 0]
            );

            // Eliminar movimiento anterior de esta compra y recalcular
            $previousMove = $account->moves()
                ->where('reference_type', Purchase::class)
                ->where('reference_id', $purchase->id)
                ->first();

            if ($previousMove) {
                $account->balance -= $previousMove->amount;
                $account->save();
                $previousMove->delete();
            }

            $this->debitVendorAccount($purchase, $companyId);
        });

        return redirect()->route('proveedores.comprobantes.index')
            ->with('success', 'Comprobante actualizado exitosamente.');
    }

    public function destroy(Purchase $purchase): \Illuminate\Http\RedirectResponse
    {
        $companyId = CompanyContext::id();

        DB::transaction(function () use ($purchase) {
            // Revertir stock si estaba recibido
            if (in_array($purchase->status, ['received', 'partial'])) {
                foreach ($purchase->purchase_items as $item) {
                    $this->updateStock(
                        $item->product_id,
                        $item->variant_id,
                        $purchase->warehouse_id,
                        -$item->received_qty,
                        $purchase->id
                    );
                }
            }

            // Revertir movimiento de cuenta corriente
            $account = VendorAccount::where('vendor_id', $purchase->vendor_id)->first();
            if ($account) {
                $move = $account->moves()
                    ->where('reference_type', Purchase::class)
                    ->where('reference_id', $purchase->id)
                    ->first();

                if ($move) {
                    $account->balance -= $move->amount;
                    $account->save();
                    $move->delete();
                }
            }

            $purchase->purchase_items()->delete();
            $purchase->delete();
        });

        return redirect()->route('proveedores.comprobantes.index')
            ->with('success', 'Comprobante eliminado exitosamente.');
    }

    private function updateStock(int $productId, ?int $variantId, int $warehouseId, float $qty, int $purchaseId): void
    {
        $stock = Stock::firstOrCreate(
            ['product_id' => $productId, 'variant_id' => $variantId, 'warehouse_id' => $warehouseId],
            ['quantity' => 0, 'min_quantity' => 0]
        );

        $before = $stock->quantity;
        $stock->quantity = max(0, $stock->quantity + $qty);
        $stock->save();

        StockMovement::create([
            'product_id' => $productId,
            'variant_id' => $variantId,
            'warehouse_id' => $warehouseId,
            'user_id' => auth()->id(),
            'type' => $qty > 0 ? 'purchase' : 'purchase_reversal',
            'quantity' => abs($qty),
            'stock_before' => $before,
            'stock_after' => $stock->quantity,
            'reference_type' => 'purchase',
            'reference_id' => $purchaseId,
            'note' => $qty > 0 ? 'Ingreso por compra #'.$purchaseId : 'Reversión compra #'.$purchaseId,
        ]);
    }

    private function debitVendorAccount(Purchase $purchase, int $companyId): void
    {
        $account = VendorAccount::firstOrCreate(
            ['vendor_id' => $purchase->vendor_id],
            ['company_id' => $companyId, 'balance' => 0]
        );

        $newBalance = $account->balance + $purchase->total;
        $account->balance = $newBalance;
        $account->save();

        VendorAccountMove::create([
            'vendor_account_id' => $account->id,
            'user_id' => auth()->id(),
            'type' => 'purchase',
            'amount' => $purchase->total,
            'balance_after' => $newBalance,
            'description' => 'Comprobante '.($purchase->invoice_type ?? '').' '.($purchase->invoice_number ?? $purchase->reference_no ?? '#'.$purchase->id),
            'reference_type' => Purchase::class,
            'reference_id' => $purchase->id,
            'move_date' => $purchase->purchased_at,
        ]);
    }
}
