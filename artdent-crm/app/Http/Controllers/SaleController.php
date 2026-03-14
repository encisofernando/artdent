<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SalePayment;
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
            'items' => $items,
            'filters' => ['search' => $search, 'status' => $status],
        ]);
    }

    private function getActiveCustomers(): \Illuminate\Support\Collection
    {
        return Customer::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'dni']);
    }

    public function create()
    {
        $products = Product::with([
            'product_images',
            'stocks',
            'product_variants' => fn ($q) => $q->where('is_active', 1)->orderBy('id'),
            'product_variants.stocks',
            'product_variants.variant_attribute_values.product_attribute_value.product_attribute',
        ])
            ->where('is_active', 1)
            ->get(['id', 'name', 'sku', 'price', 'cost_price', 'tax_rate', 'track_stock', 'has_variants'])
            ->map(function ($p) {
                $arr = $p->toArray();
                $arr['image'] = $p->product_images->first()?->url ?? null;
                $variantsMapped = $p->product_variants->map(function ($v) {
                    $label = $v->variant_attribute_values
                        ->map(fn ($vav) => $vav->product_attribute_value->value)
                        ->join(' / ');

                    return [
                        'id' => $v->id,
                        'sku' => $v->sku,
                        'price' => (float) $v->price,
                        'is_active' => $v->is_active,
                        'label' => $label,
                        'stock_quantity' => $v->stocks->sum('quantity'),
                    ];
                })->values();

                // For variant products, total stock = sum of all variant stocks
                $arr['stock_quantity'] = $p->has_variants
                    ? $variantsMapped->sum('stock_quantity')
                    : $p->stocks->whereNull('variant_id')->sum('quantity');
                $arr['variants'] = $variantsMapped;

                return $arr;
            });

        return Inertia::render('Sale/Create', [
            'products' => $products,
            'customers' => $this->getActiveCustomers(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'items.*.total' => 'required|numeric|min:0',
            'subtotal' => 'nullable|numeric',
            'discount_amount' => 'nullable|numeric',
            'tax_amount' => 'nullable|numeric',
            'total' => 'required|numeric|min:0',
            'paid_amount' => 'nullable|numeric|min:0',
            'payment_method' => 'nullable|string',
            'receipt_type' => 'nullable|string',
            'notes' => 'nullable|string',
            'customer_name' => 'nullable|string',
            'customer_id' => 'nullable|integer|exists:customers,id',
        ]);

        $companyId = auth()->user()->company_id ?? 1;
        $userId = auth()->id();

        $warehouse = Warehouse::firstOrCreate(
            ['company_id' => $companyId],
            ['name' => 'Depósito Principal', 'code' => 'DEP-01', 'is_active' => true]
        );

        // ── Número de comprobante formato 00001-00000001 ──────────────────────
        $receiptType = strtoupper($request->receipt_type ?? 'X');
        $company = \App\Models\Company::find($companyId);

        // X → punto de venta fijo 00001 | A/B/C → companies.afip_point_sale
        $pointSale = in_array($receiptType, ['A', 'B', 'C'])
            ? str_pad($company?->afip_point_sale ?? 1, 5, '0', STR_PAD_LEFT)
            : '00001';

        $sequence = Sale::where('company_id', $companyId)
            ->where('receipt_type', $receiptType)
            ->count() + 1;
        $saleNumber = $pointSale.'-'.str_pad($sequence, 8, '0', STR_PAD_LEFT);
        // ─────────────────────────────────────────────────────────────────────

        $isCuentaCorriente = $request->payment_method === 'cuenta_corriente';
        $total = (float) $request->total;
        $paidAmount = $isCuentaCorriente ? 0.0 : (float) ($request->paid_amount ?? $total);
        $change = $isCuentaCorriente ? 0.0 : max(0, $paidAmount - $total);

        $notes = $request->notes ?? '';
        if (! empty($request->customer_name) && $request->customer_name !== 'Consumidor Final') {
            $notes = 'Cliente: '.$request->customer_name.($notes ? "\n".$notes : '');
        }

        DB::beginTransaction();
        try {
            $sale = Sale::create([
                'company_id' => $companyId,
                'user_id' => $userId,
                'customer_id' => $request->customer_id ?: null,
                'sale_number' => $saleNumber,
                'receipt_type' => $receiptType,
                'status' => $isCuentaCorriente ? 'pending' : 'completed',
                'subtotal' => $request->subtotal ?? 0,
                'discount_amount' => $request->discount_amount ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'total' => $total,
                'paid_amount' => $paidAmount,
                'change_amount' => $change,
                'notes' => $notes,
                'sold_at' => now(),
            ]);

            if ($isCuentaCorriente && $request->customer_id) {
                // Cargar a cuenta corriente del cliente
                $account = CustomerAccount::firstOrCreate(
                    ['customer_id' => $request->customer_id],
                    ['balance' => 0]
                );
                $newBalance = $account->balance + $total;
                $move = CustomerAccountMove::create([
                    'customer_account_id' => $account->id,
                    'user_id' => $userId,
                    'type' => CustomerAccountMove::TYPE_CHARGE,
                    'amount' => $total,
                    'balance_after' => $newBalance,
                    'description' => "Venta POS {$saleNumber}",
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'move_date' => now()->toDateString(),
                ]);
                $account->applyMove($move);
            } else {
                // Registrar método de pago normal
                $pm = PaymentMethod::where('name', $request->payment_method)
                    ->orWhere('type', $request->payment_method)
                    ->first();
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'payment_method_id' => $pm?->id ?? null,
                    'amount' => $paidAmount,
                    'paid_at' => now(),
                ]);
            }

            // Crear ítems y descontar stock
            foreach ($request->items as $item) {
                $qty = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $discount = (float) ($item['discount'] ?? 0);
                $lineTotal = (float) $item['total'];
                $taxAmount = isset($item['tax_rate']) && $item['tax_rate'] > 0
                    ? round($lineTotal - ($lineTotal / (1 + $item['tax_rate'])), 2)
                    : 0;

                $product = Product::find($item['product_id']);
                $variantId = isset($item['variant_id']) ? (int) $item['variant_id'] : null;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $item['product_id'],
                    'variant_id' => $variantId,
                    'product_name' => $item['name'] ?? ($product->name ?? 'Producto'),
                    'sku' => $item['variant_sku'] ?? $product->sku ?? null,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'discount' => $discount,
                    'tax_amount' => $taxAmount,
                    'total' => $lineTotal,
                ]);

                if ($product && $product->track_stock) {
                    $stock = Stock::firstOrCreate(
                        ['product_id' => $item['product_id'], 'variant_id' => $variantId, 'warehouse_id' => $warehouse->id],
                        ['quantity' => 0]
                    );

                    $stockBefore = (float) $stock->quantity;
                    $stockAfter = $stockBefore - $qty;

                    $stock->update(['quantity' => $stockAfter]);

                    StockMovement::create([
                        'product_id' => $item['product_id'],
                        'variant_id' => $variantId,
                        'warehouse_id' => $warehouse->id,
                        'user_id' => $userId,
                        'type' => 'out',
                        'quantity' => $qty,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'sale',
                        'reference_id' => $sale->id,
                        'note' => "Venta POS {$saleNumber}",
                    ]);
                }
            }

            DB::commit();

            // Cargar relaciones para el modal post-venta del frontend
            $sale->load([
                'sale_items',
                'sale_payments.paymentMethod',
                'company',
                'user',
            ]);

            // Retornamos Sale/Create con el prop 'sale' para que el modal
            // post-cobro del frontend lo reciba en onSuccess → page.props.sale
            // (NO hacemos redirect para que preserveState funcione)
            return Inertia::render('Sale/Create', [
                'products' => Product::with([
                    'product_images',
                    'stocks',
                    'product_variants' => fn ($q) => $q->where('is_active', 1)->orderBy('id'),
                    'product_variants.stocks',
                    'product_variants.variant_attribute_values.product_attribute_value.product_attribute',
                ])
                    ->where('is_active', 1)
                    ->get(['id', 'name', 'sku', 'price', 'cost_price', 'tax_rate', 'track_stock', 'has_variants'])
                    ->map(function ($p) {
                        $arr = $p->toArray();
                        $arr['image'] = $p->product_images->first()?->url ?? null;
                        $variantsMapped = $p->product_variants->map(function ($v) {
                            $label = $v->variant_attribute_values
                                ->map(fn ($vav) => $vav->product_attribute_value->value)
                                ->join(' / ');

                            return [
                                'id' => $v->id,
                                'sku' => $v->sku,
                                'price' => (float) $v->price,
                                'is_active' => $v->is_active,
                                'label' => $label,
                                'stock_quantity' => $v->stocks->sum('quantity'),
                            ];
                        })->values();

                        $arr['stock_quantity'] = $p->has_variants
                            ? $variantsMapped->sum('stock_quantity')
                            : $p->stocks->whereNull('variant_id')->sum('quantity');
                        $arr['variants'] = $variantsMapped;

                        return $arr;
                    }),
                'customers' => $this->getActiveCustomers(),
                'sale' => array_merge($sale->toArray(), [
                    'sale_payments' => $sale->sale_payments->map(fn ($p) => [
                        'amount' => $p->amount,
                        'payment_method' => $p->paymentMethod
                            ? ['name' => $p->paymentMethod->name, 'type' => $p->paymentMethod->type]
                            : null,
                    ]),
                    // Alias para el TicketBase del frontend
                    'customer_name' => $request->customer_name ?? 'Consumidor Final',
                    'items' => $sale->sale_items->toArray(),
                ]),
            ]);

        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('SaleController@store error: '.$e->getMessage(), [
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
        $sale->load([
            'sale_items',
            'sale_payments.paymentMethod',
            'company',
            'user',
            'customer',
        ]);

        $accountData = null;
        if ($sale->customer_id) {
            $account = CustomerAccount::firstOrCreate(
                ['customer_id' => $sale->customer_id],
                ['balance' => 0]
            );
            $accountData = ['id' => $account->id, 'balance' => $account->balance];
        }

        $paymentMethods = PaymentMethod::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Sale/Show', [
            'sale' => array_merge($sale->toArray(), [
                'sale_payments' => $sale->sale_payments->map(fn ($p) => [
                    'amount' => $p->amount,
                    'payment_method' => $p->paymentMethod
                        ? ['name' => $p->paymentMethod->name, 'type' => $p->paymentMethod->type]
                        : null,
                ]),
                'customer' => $sale->customer
                    ? $sale->customer->only('id', 'name', 'phone', 'dni')
                    : null,
            ]),
            'account' => $accountData,
            'paymentMethods' => $paymentMethods,
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
                        $cancelVariantId = $item->variant_id ?? null;

                        $stock = Stock::firstOrCreate(
                            ['product_id' => $item->product_id, 'variant_id' => $cancelVariantId, 'warehouse_id' => $warehouse->id],
                            ['quantity' => 0]
                        );

                        $stockBefore = (float) $stock->quantity;
                        $stockAfter = $stockBefore + $item->quantity;

                        $stock->update(['quantity' => $stockAfter]);

                        StockMovement::create([
                            'product_id' => $item->product_id,
                            'variant_id' => $cancelVariantId,
                            'warehouse_id' => $warehouse->id,
                            'user_id' => auth()->id(),
                            'type' => 'in',
                            'quantity' => $item->quantity,
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockAfter,
                            'reference_type' => 'sale_cancellation',
                            'reference_id' => $sale->id,
                            'note' => "Cancelación venta {$sale->sale_number}",
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

            return back()->withErrors(['error' => 'Error al cancelar: '.$e->getMessage()]);
        }
    }
}
