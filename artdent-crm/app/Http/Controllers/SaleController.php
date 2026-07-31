<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\Company;
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
use App\Services\CustomerAccountSaleAllocator;
use App\Services\EmailTemplateService;
use App\Services\SalePaymentService;
use App\Services\StockAlertService;
use App\Support\Auditor;
use App\Support\CompanyContext;
use App\Support\PlanLimitService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SaleController extends Controller
{
    private const POS_PAYMENT_METHOD_LABELS = [
        'cash' => 'Efectivo',
        'debit' => 'Débito',
        'credit' => 'Crédito',
        'transfer' => 'Transferencia',
        'cuenta_corriente' => 'Cuenta Corriente',
        'nave_qr' => 'QR (Nave)',
    ];

    // Métodos que no se cobran en el momento de crear la venta — la venta
    // queda 'pending' por ese monto hasta que se confirme aparte
    // (cuenta_corriente: es deuda; nave_qr: se confirma por webhook de Nave
    // vía NavePosPaymentController, ver SalePaymentService).
    private const UNSETTLED_PAYMENT_METHODS = ['cuenta_corriente', 'nave_qr'];

    public function index(Request $request, CustomerAccountSaleAllocator $allocator)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Sale::with(['sale_items', 'customer:id,name'])
            ->where('company_id', CompanyContext::id());

        if ($search) {
            $query->where('sale_number', 'like', "%{$search}%");
        }

        if ($status === 'paid') {
            $query->whereIn('status', ['paid', 'completed']);
        } elseif ($status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('id')->paginate(20)->withQueryString();

        $customerIds = $items->getCollection()
            ->pluck('customer_id')
            ->filter()
            ->unique()
            ->values();

        if ($customerIds->isNotEmpty()) {
            DB::transaction(function () use ($allocator, $customerIds) {
                $companyId = CompanyContext::id();

                foreach ($customerIds as $customerId) {
                    $allocator->reconcileUnlinkedPaymentsForCustomer((int) $customerId, $companyId);
                }
            });

            $items->setCollection(
                $items->getCollection()->map(function (Sale $sale) {
                    $sale->refresh();
                    $sale->load(['sale_items', 'customer:id,name']);

                    return $sale;
                })
            );
        }

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
            'barcodes',
        ])
            ->where('is_active', 1)
            ->get(['id', 'name', 'sku', 'barcode', 'price', 'cost_price', 'tax_rate', 'track_stock', 'has_variants'])
            ->map(function ($p) {
                $arr = $p->toArray();
                $coverImg = $p->product_images->firstWhere('is_cover', true) ?? $p->product_images->first();
                $arr['image'] = $coverImg?->thumb_url ?? $coverImg?->url ?? null;
                $arr['extra_barcodes'] = $p->barcodes->whereNull('variant_id')->pluck('barcode')->values()->all();
                $barcodesByVariant = $p->barcodes->whereNotNull('variant_id')->groupBy('variant_id');
                $variantsMapped = $p->product_variants->map(function ($v) use ($barcodesByVariant) {
                    $attributes = $v->variant_attribute_values
                        ->map(function ($vav) {
                            $value = $vav->product_attribute_value;
                            $attribute = $value?->product_attribute;

                            if (! $value || ! $attribute) {
                                return null;
                            }

                            return [
                                'attribute_id' => $attribute->id,
                                'attribute_name' => $attribute->name,
                                'value_id' => $value->id,
                                'value' => $value->value,
                            ];
                        })
                        ->filter()
                        ->values();

                    $label = $attributes->pluck('value')->join(' / ');

                    return [
                        'id' => $v->id,
                        'sku' => $v->sku,
                        'barcode' => $v->barcode,
                        'extra_barcodes' => ($barcodesByVariant->get($v->id) ?? collect())->pluck('barcode')->values()->all(),
                        'price' => (float) $v->price,
                        'is_active' => $v->is_active,
                        'label' => $label,
                        'attributes' => $attributes,
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

        $company = \App\Models\Company::where('id', CompanyContext::id())
            ->first(['id', 'iva_condition', 'afip_point_sale', 'cuit', 'name', 'fantasy_name',
                'address', 'city', 'province', 'phone', 'email', 'iibb', 'start_date', 'logo_url',
                'whatsapp_message_template']);

        return Inertia::render('Sale/Create', [
            'products' => $products,
            'customers' => $this->getActiveCustomers(),
            'company' => $company,
        ]);
    }

    public function store(Request $request, PlanLimitService $limits)
    {
        $limits->assertCanRecordSale();

        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|integer|exists:products,id',
            'items.*.variant_id' => 'nullable|integer|exists:product_variants,id',
            'items.*.name' => 'required|string|max:255',
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
            'issue_date' => 'nullable|date|before_or_equal:today',
            'payments' => 'nullable|array|min:1',
            'payments.*.method' => 'required_with:payments|string',
            'payments.*.amount' => 'required_with:payments|numeric|min:0.01',
        ]);

        $companyId = CompanyContext::id();
        $userId = auth()->id();

        $warehouse = Warehouse::firstOrCreate(
            ['company_id' => $companyId],
            ['name' => 'Depósito Principal', 'code' => 'DEP-01', 'is_active' => true]
        );

        // ── Número de comprobante formato 00001-00000001 ──────────────────────
        $receiptType = strtoupper($request->receipt_type ?? 'X');
        $company = \App\Models\Company::find($companyId);

        // X → punto de venta fijo 00001 | A/B/C/FA/FB/FC/NC*/ND* → punto de venta
        // AFIP resuelto por sucursal (con fallback al default de la empresa).
        $isAfipType = in_array($receiptType, ['A', 'B', 'C', 'FA', 'FB', 'FC', 'NCA', 'NCB', 'NCC', 'NDA', 'NDB', 'NDC']);
        $resolvedPos = \App\Models\AfipPointOfSale::resolveFor($companyId, $request->integer('branch_id') ?: null);
        $pointSale = $isAfipType
            ? str_pad($resolvedPos->point_sale ?? 1, 5, '0', STR_PAD_LEFT)
            : '00001';

        // MAX sobre la secuencia numérica del sale_number para el mismo punto de venta.
        // COUNT era frágil: reiniciaba cuando ventas AFIP revertían a 'X'.
        $maxSeq = Sale::where('company_id', $companyId)
            ->where('sale_number', 'like', $pointSale.'-%')
            ->max(\DB::raw("CAST(SUBSTRING_INDEX(sale_number, '-', -1) AS UNSIGNED)"));
        $sequence = ($maxSeq ?? 0) + 1;
        $saleNumber = $pointSale.'-'.str_pad($sequence, 8, '0', STR_PAD_LEFT);
        // ─────────────────────────────────────────────────────────────────────

        $total = (float) $request->total;
        $soldAt = $request->filled('issue_date')
            ? Carbon::parse($request->issue_date)->setTimeFromTimeString(now()->format('H:i:s'))
            : now();
        $payments = $this->normalizeSalePayments($request, $total);
        $accountAmount = round(collect($payments)
            ->where('method', 'cuenta_corriente')
            ->sum('amount'), 2);
        $settledAmount = round(collect($payments)
            ->reject(fn (array $payment) => in_array($payment['method'], self::UNSETTLED_PAYMENT_METHODS, true))
            ->sum('amount'), 2);
        $isSingleCashPayment = count($payments) === 1 && $payments[0]['method'] === 'cash';
        $tenderedAmount = $isSingleCashPayment
            ? max((float) ($request->paid_amount ?? $settledAmount), $settledAmount)
            : $settledAmount;
        $paidAmount = $settledAmount;
        $change = $isSingleCashPayment ? max(0, $tenderedAmount - $total) : 0.0;
        $status = $paidAmount + 0.00001 >= $total ? 'completed' : 'pending';

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
                'status' => $status,
                'subtotal' => $request->subtotal ?? 0,
                'discount_amount' => $request->discount_amount ?? 0,
                'tax_amount' => $request->tax_amount ?? 0,
                'total' => $total,
                'paid_amount' => $paidAmount,
                'change_amount' => $change,
                'notes' => $notes,
                'sold_at' => $soldAt,
            ]);

            if ($accountAmount > 0.0) {
                $account = CustomerAccount::firstOrCreate(
                    ['customer_id' => $request->customer_id],
                    ['balance' => 0]
                );
                $newBalance = $account->balance + $accountAmount;
                $move = CustomerAccountMove::create([
                    'customer_account_id' => $account->id,
                    'user_id' => $userId,
                    'type' => CustomerAccountMove::TYPE_CHARGE,
                    'amount' => $accountAmount,
                    'balance_after' => $newBalance,
                    'description' => $accountAmount + 0.00001 >= $total
                        ? "Venta POS {$saleNumber}"
                        : "Saldo cuenta corriente venta POS {$saleNumber}",
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                    'move_date' => $soldAt->toDateString(),
                ]);
                $account->applyMove($move);
            }

            foreach ($payments as $payment) {
                if (in_array($payment['method'], self::UNSETTLED_PAYMENT_METHODS, true)) {
                    continue;
                }

                $pm = $this->resolveSalePaymentMethod($payment['method']);
                SalePayment::create([
                    'sale_id' => $sale->id,
                    'payment_method_id' => $pm?->id ?? null,
                    'amount' => $payment['amount'],
                    'paid_at' => $soldAt,
                ]);
            }

            $this->linkSaleToOpenCashSession($sale, $companyId, $payments);

            // Crear ítems y descontar stock
            foreach ($request->items as $item) {
                $qty = (float) $item['quantity'];
                $unitPrice = (float) $item['unit_price'];
                $discount = (float) ($item['discount'] ?? 0);
                $lineTotal = (float) $item['total'];
                $taxAmount = isset($item['tax_rate']) && $item['tax_rate'] > 0
                    ? round($lineTotal - ($lineTotal / (1 + $item['tax_rate'])), 2)
                    : 0;

                $productId = $item['product_id'] ?? null;
                $product = $productId ? Product::find($productId) : null;
                $variantId = isset($item['variant_id']) ? (int) $item['variant_id'] : null;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'product_name' => $item['name'] ?? ($product->name ?? 'Producto manual'),
                    'sku' => $item['variant_sku'] ?? $product->sku ?? null,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'discount' => $discount,
                    'tax_rate' => isset($item['tax_rate']) && (float) $item['tax_rate'] > 0
                        ? (float) $item['tax_rate']
                        : null,
                    'tax_amount' => $taxAmount,
                    'total' => $lineTotal,
                ]);

                if ($product && $product->track_stock) {
                    $stock = Stock::firstOrCreate(
                        ['product_id' => $productId, 'variant_id' => $variantId, 'warehouse_id' => $warehouse->id],
                        ['quantity' => 0]
                    );

                    $stockBefore = (float) $stock->quantity;
                    $stockAfter = $stockBefore - $qty;

                    $stock->update(['quantity' => $stockAfter]);

                    StockMovement::create([
                        'product_id' => $productId,
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

                    StockAlertService::checkAndNotify($productId, $variantId, $warehouse->id);
                }
            }

            DB::commit();

            // ── Auto-facturación AFIP ─────────────────────────────────────────
            // Mapa de receipt_type (formato legacy A/B/C y nuevo FA/FB/FC) → receipt_key AFIP
            $afipKeyMap = [
                'A' => 'FA', 'FA' => 'FA',
                'B' => 'FB', 'FB' => 'FB',
                'C' => 'FC', 'FC' => 'FC',
                'NCA' => 'NCA', 'NCB' => 'NCB', 'NCC' => 'NCC',
                'NDA' => 'NDA', 'NDB' => 'NDB', 'NDC' => 'NDC',
            ];
            if (isset($afipKeyMap[$receiptType])) {
                $company->refresh();
                if ($company->afip_auto_invoice) {
                    try {
                        \App\Jobs\GenerateAfipInvoiceJob::dispatch(
                            $sale->id,
                            $afipKeyMap[$receiptType]
                        );
                    } catch (\Throwable $e) {
                        \Illuminate\Support\Facades\Log::warning('Auto-factura AFIP falló (no bloquea la venta)', [
                            'sale_id' => $sale->id,
                            'error' => $e->getMessage(),
                        ]);
                        // Revertir a ticket X para que el operador pueda reintentar manualmente
                        $sale->update(['receipt_type' => 'X']);
                        $sale->refresh();
                    }
                }
            }
            // ─────────────────────────────────────────────────────────────────

            // Recargar atributos del modelo para reflejar el sale_number asignado por AFIP
            $sale->refresh();

            // Cargar relaciones para el modal post-venta del frontend
            $sale->load([
                'sale_items',
                'sale_payments.paymentMethod',
                'company',
                'user',
                'invoice.invoice_type',
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
                        $coverImg = $p->product_images->firstWhere('is_cover', true) ?? $p->product_images->first();
                        $arr['image'] = $coverImg?->thumb_url ?? $coverImg?->url ?? null;
                        $variantsMapped = $p->product_variants->map(function ($v) {
                            $attributes = $v->variant_attribute_values
                                ->map(function ($vav) {
                                    $value = $vav->product_attribute_value;
                                    $attribute = $value?->product_attribute;

                                    if (! $value || ! $attribute) {
                                        return null;
                                    }

                                    return [
                                        'attribute_id' => $attribute->id,
                                        'attribute_name' => $attribute->name,
                                        'value_id' => $value->id,
                                        'value' => $value->value,
                                    ];
                                })
                                ->filter()
                                ->values();

                            $label = $attributes->pluck('value')->join(' / ');

                            return [
                                'id' => $v->id,
                                'sku' => $v->sku,
                                'barcode' => $v->barcode,
                                'price' => (float) $v->price,
                                'is_active' => $v->is_active,
                                'label' => $label,
                                'attributes' => $attributes,
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
                'company' => $company ? $company->only([
                    'id', 'iva_condition', 'afip_point_sale', 'cuit', 'name', 'fantasy_name',
                    'address', 'city', 'province', 'phone', 'email', 'iibb', 'start_date', 'logo_url',
                    'whatsapp_message_template',
                ]) : null,
                'sale' => array_merge($sale->toArray(), [
                    'sale_payments' => $sale->sale_payments->map(fn ($p) => [
                        'amount' => $p->amount,
                        'payment_method' => $p->paymentMethod
                            ? ['name' => $p->paymentMethod->name, 'type' => $p->paymentMethod->type]
                            : null,
                    ]),
                    'payment_breakdown' => $this->buildPaymentBreakdown($sale),
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
    public function show(Sale $sale, CustomerAccountSaleAllocator $allocator)
    {
        if ($sale->customer_id) {
            DB::transaction(function () use ($allocator, $sale) {
                $allocator->reconcileUnlinkedPaymentsForCustomer(
                    $sale->customer_id,
                    $sale->company_id
                );
            });

            $sale->refresh();
        }

        $sale->load([
            'sale_items',
            'sale_payments.paymentMethod',
            'company',
            'user',
            'customer',
            'invoice.invoice_type',
            'sale_returns.items',
            'sale_returns.user:id,name',
        ]);

        $returnedQtyByItem = $sale->sale_returns
            ->flatMap(fn ($return) => $return->items)
            ->groupBy('sale_item_id')
            ->map(fn ($items) => $items->sum('quantity'));

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
                'sale_items' => $sale->sale_items->map(fn ($item) => array_merge($item->toArray(), [
                    'returned_quantity' => (float) ($returnedQtyByItem[$item->id] ?? 0),
                ])),
                'sale_payments' => $sale->sale_payments->map(fn ($p) => [
                    'amount' => $p->amount,
                    'payment_method' => $p->paymentMethod
                        ? ['name' => $p->paymentMethod->name, 'type' => $p->paymentMethod->type]
                        : null,
                ]),
                'payment_breakdown' => $this->buildPaymentBreakdown($sale),
                'customer' => $sale->customer
                    ? $sale->customer->only('id', 'name', 'phone', 'dni', 'cuit', 'email')
                    : null,
                'sale_returns' => $sale->sale_returns,
            ]),
            'account' => $accountData,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * POST /sales/{sale}/pay
     * Registra un cobro parcial o total sobre la venta, actualiza paid_amount/status
     * y acredita la cuenta corriente del cliente si corresponde.
     */
    public function pay(Request $request, Sale $sale, SalePaymentService $salePaymentService)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method_id' => ['nullable', 'integer', 'exists:payment_methods,id'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $salePaymentService->registerPayment(
                $sale,
                (float) $validated['amount'],
                $validated['payment_method_id'] ?? null,
                $validated['description'] ?? null,
            );
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        } catch (\Throwable $e) {
            return response()->json(['message' => 'Error al registrar el pago: '.$e->getMessage()], 500);
        }

        return response()->json([
            'paid_amount' => $sale->fresh()->paid_amount,
            'status' => $sale->fresh()->status,
            'balance' => $sale->customer_id
                ? CustomerAccount::where('customer_id', $sale->customer_id)->value('balance')
                : null,
        ]);
    }

    public function destroy(Sale $sale)
    {
        if ($sale->status === 'cancelled') {
            return back()->withErrors(['error' => 'La venta ya está cancelada.']);
        }

        if ($sale->receipt_type !== 'X') {
            return back()->withErrors(['error' => 'Los comprobantes fiscales no pueden eliminarse. Emití una Nota de Crédito o Débito.']);
        }

        $companyId = CompanyContext::id();
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

            Auditor::log('sale.cancelled', $sale, ['total' => (float) $sale->total, 'sale_number' => $sale->sale_number]);

            return redirect()
                ->route('sales.index')
                ->with('success', "Venta {$sale->sale_number} cancelada.");

        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Error al cancelar: '.$e->getMessage()]);
        }
    }

    private function normalizeSalePayments(Request $request, float $total): array
    {
        $payments = collect($request->input('payments', []))
            ->map(function (array $payment) {
                return [
                    'method' => strtolower(trim((string) ($payment['method'] ?? ''))),
                    'amount' => round((float) ($payment['amount'] ?? 0), 2),
                ];
            })
            ->filter(fn (array $payment) => $payment['method'] !== '' && $payment['amount'] > 0)
            ->values();

        if ($payments->isEmpty()) {
            $legacyMethod = strtolower(trim((string) ($request->input('payment_method') ?: 'cash')));
            $payments = collect([[
                'method' => $legacyMethod,
                'amount' => round($total, 2),
            ]]);
        }

        $allowedMethods = array_keys(self::POS_PAYMENT_METHOD_LABELS);
        $invalidMethod = $payments->first(fn (array $payment) => ! in_array($payment['method'], $allowedMethods, true));
        if ($invalidMethod) {
            throw ValidationException::withMessages([
                'payments' => 'Uno de los medios de pago seleccionados no es válido.',
            ]);
        }

        $duplicateMethod = $payments
            ->groupBy('method')
            ->first(fn ($group) => $group->count() > 1);
        if ($duplicateMethod) {
            throw ValidationException::withMessages([
                'payments' => 'No repitas el mismo medio de pago. Ajustá el monto en un único renglón.',
            ]);
        }

        $distributedTotal = round((float) $payments->sum('amount'), 2);
        if (abs($distributedTotal - $total) > 0.01) {
            throw ValidationException::withMessages([
                'payments' => 'La suma de los medios de pago debe coincidir exactamente con el total del comprobante.',
            ]);
        }

        if ($payments->contains(fn (array $payment) => $payment['method'] === 'cuenta_corriente') && ! $request->filled('customer_id')) {
            throw ValidationException::withMessages([
                'customer_id' => 'Seleccioná un cliente para poder usar cuenta corriente.',
            ]);
        }

        return $payments->all();
    }

    private function resolveSalePaymentMethod(string $method): ?PaymentMethod
    {
        $method = strtolower($method);
        $aliases = match ($method) {
            'cash' => ['cash', 'efectivo'],
            'debit' => ['debit', 'debito', 'débito'],
            'credit' => ['credit', 'credito', 'crédito'],
            'transfer' => ['transfer', 'transferencia'],
            default => [$method],
        };

        return PaymentMethod::query()
            ->where('is_active', true)
            ->where(function ($query) use ($aliases) {
                foreach ($aliases as $alias) {
                    $query->orWhereRaw('LOWER(name) = ?', [$alias])
                        ->orWhereRaw('LOWER(type) = ?', [$alias]);
                }
            })
            ->first();
    }

    /**
     * Si hay exactamente una caja abierta para la empresa, adjunta la venta a esa sesión
     * y registra el ingreso en efectivo como un movimiento de caja. Con más de una sesión
     * abierta simultánea no se puede saber a qué caja pertenece esta venta (todavía no hay
     * un selector de caja en el punto de venta), así que en ese caso no se vincula nada y
     * la venta sigue su curso normal sin afectar ninguna caja.
     *
     * @param  array<int, array{method: string, amount: float}>  $payments
     */
    private function linkSaleToOpenCashSession(Sale $sale, int $companyId, array $payments): void
    {
        $cashAmount = round(collect($payments)->where('method', 'cash')->sum('amount'), 2);

        if ($cashAmount <= 0) {
            return;
        }

        $openSessions = CashSession::query()
            ->where('status', 'open')
            ->whereHas('cash_drawer', fn ($query) => $query->where('company_id', $companyId))
            ->get();

        if ($openSessions->count() !== 1) {
            return;
        }

        $session = $openSessions->first();
        $sale->update(['cash_session_id' => $session->id]);

        CashMovement::create([
            'cash_session_id' => $session->id,
            'payment_method_id' => $this->resolveSalePaymentMethod('cash')?->id,
            'type' => 'in',
            'amount' => $cashAmount,
            'concept' => "Venta {$sale->sale_number}",
            'reference_type' => 'sale',
            'reference_id' => $sale->id,
        ]);
    }

    private function buildPaymentBreakdown(Sale $sale): array
    {
        $breakdown = $sale->sale_payments->map(function (SalePayment $payment) {
            $methodType = strtolower((string) ($payment->paymentMethod?->type ?? ''));
            $methodName = $payment->paymentMethod?->name
                ?? self::POS_PAYMENT_METHOD_LABELS[$methodType]
                ?? 'Pago';

            return [
                'method_key' => $methodType !== '' ? $methodType : strtolower($methodName),
                'method_name' => $methodName,
                'amount' => (float) $payment->amount,
                'is_account' => false,
            ];
        })->values();

        $accountAmount = round((float) CustomerAccountMove::query()
            ->where('reference_type', 'sale')
            ->where('reference_id', $sale->id)
            ->where('type', CustomerAccountMove::TYPE_CHARGE)
            ->sum('amount'), 2);

        if ($accountAmount > 0.0) {
            $breakdown->push([
                'method_key' => 'cuenta_corriente',
                'method_name' => self::POS_PAYMENT_METHOD_LABELS['cuenta_corriente'],
                'amount' => $accountAmount,
                'is_account' => true,
            ]);
        }

        return $breakdown->all();
    }

    /**
     * Genera un PDF del comprobante a partir del HTML renderizado en el frontend
     * y devuelve la URL pública para compartir (ej. por WhatsApp).
     */
    /**
     * Guarda el HTML del comprobante como página estática y devuelve la URL
     * pública para compartir por WhatsApp. Sin dependencias de Node/Chrome.
     */
    public function sendEmail(Request $request, Sale $sale): \Illuminate\Http\JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $company = Company::findOrFail(CompanyContext::id());
        $customer = $sale->customer;
        $saleUrl = route('quotes.public', ['token' => $sale->public_token ?? ''])
                    ?: url("/sales/{$sale->id}");

        $vars = [
            'empresa' => $company->fantasy_name ?: $company->name,
            'numero' => $sale->sale_number ?? $sale->id,
            'cliente' => $customer?->name ?? 'Cliente',
            'total' => '$'.number_format((float) $sale->total, 2, ',', '.'),
            'fecha' => ($sale->sold_at ?? $sale->created_at ?? now())->format('d/m/Y'),
            'link' => $saleUrl,
        ];

        app(EmailTemplateService::class)->send('sale', $request->email, $company, $vars);

        return response()->json(['ok' => true]);
    }

    public function generatePdf(Request $request, Sale $sale): \Illuminate\Http\JsonResponse
    {
        $request->validate(['html' => 'required|string|max:2000000']);

        $filename = 'sale-'.($sale->sale_number ?? $sale->id).'.html';
        Storage::disk('public')->put('receipts/'.$filename, $request->html);

        return response()->json([
            'url' => Storage::disk('public')->url('receipts/'.$filename),
        ]);
    }
}
