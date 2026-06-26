<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmed;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderItem;
use App\Models\Offer;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Stock;
use App\Services\StockAlertService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    private function normalizeVariantAttributeName(?string $name): string
    {
        return preg_replace('/\s+/u', ' ', trim((string) $name)) ?: '';
    }

    private function normalizeVariantAttributeValue(mixed $value): string
    {
        $normalized = preg_replace('/\s+/u', ' ', trim((string) $value)) ?: '';

        return mb_strtoupper($normalized, 'UTF-8');
    }

    private function defaultCompanyId(): int
    {
        return (int) env('ECOMMERCE_COMPANY_ID', 1);
    }

    private function defaultWarehouseId(): int
    {
        return (int) env('ECOMMERCE_WAREHOUSE_ID', 1);
    }

    public function products(Request $request): JsonResponse
    {
        $companyId = $request->integer('company_id') ?: $this->defaultCompanyId();
        $warehouseId = $request->integer('warehouse_id') ?: $this->defaultWarehouseId();

        $now = now();

        $query = Product::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->where(function ($q): void {
                $q->whereNull('internal_use')->orWhere('internal_use', false);
            })
            ->with([
                'category:id,name,slug',
                'product_images' => fn ($q) => $q->orderBy('sort_order'),
                'offers' => fn ($q) => $q
                    ->where('is_active', true)
                    ->where(function ($sq) use ($now): void {
                        $sq->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
                    })
                    ->where(function ($sq) use ($now): void {
                        $sq->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
                    }),
            ]);

        if ($search = $request->string('q')->toString()) {
            $query->where(function ($q) use ($search): void {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($categoryId = $request->integer('category_id')) {
            // Include products from the selected category AND all its subcategories
            $childIds = Category::query()
                ->where('parent_id', $categoryId)
                ->pluck('id');

            $ids = $childIds->prepend($categoryId);
            $query->whereIn('category_id', $ids);
        }

        if ($brand = $request->string('brand')->toString()) {
            $query->where('brand', $brand);
        }

        if ($request->boolean('has_offer')) {
            $activeOfferProductIds = Offer::query()
                ->where('company_id', $companyId)
                ->where('is_active', true)
                ->where(function ($q) use ($now): void {
                    $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
                })
                ->where(function ($q) use ($now): void {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
                })
                ->with('products:id')
                ->get()
                ->flatMap(fn ($o) => $o->products->pluck('id'))
                ->unique();
            $query->whereIn('id', $activeOfferProductIds);
        }

        $perPage = min($request->integer('per_page', 24), 100);
        $sort = $request->string('sort', 'relevantes')->toString();

        $stockPriority = "(SELECT COALESCE(SUM(quantity), 0) FROM stocks
                           WHERE stocks.product_id = products.id
                             AND stocks.warehouse_id = {$warehouseId}) > 0";

        if ($sort === 'nuevos') {
            $query->orderByRaw("{$stockPriority} DESC")->orderByDesc('products.created_at');
        } elseif ($sort === 'precio_asc') {
            $query->orderByRaw("{$stockPriority} DESC")
                ->orderBy('price');
        } elseif ($sort === 'precio_desc') {
            $query->orderByRaw("{$stockPriority} DESC")
                ->orderByDesc('price');
        } else {
            // relevantes: más vendidos primero
            $salesCount = "(SELECT COALESCE(SUM(eoi.quantity), 0)
                            FROM ecommerce_order_items eoi
                            INNER JOIN ecommerce_orders eo ON eo.id = eoi.order_id
                            WHERE eoi.product_id = products.id
                              AND eo.status NOT IN ('cancelled', 'refunded'))";
            $query->orderByRaw("{$salesCount} DESC")
                ->orderByRaw("{$stockPriority} DESC")
                ->orderBy('name');
        }

        $paginated = $query->paginate($perPage);

        // Attach stock to each product (base stock, no variant)
        $productIds = $paginated->pluck('id');
        $stocks = Stock::query()
            ->whereIn('product_id', $productIds)
            ->where('warehouse_id', $warehouseId)
            ->whereNull('variant_id')
            ->groupBy('product_id')
            ->selectRaw('product_id, SUM(quantity) as total')
            ->pluck('total', 'product_id');

        // Variant stock aggregated per product (for products with variants)
        $variantStocks = Stock::query()
            ->whereIn('product_id', $productIds)
            ->where('warehouse_id', $warehouseId)
            ->whereNotNull('variant_id')
            ->groupBy('product_id')
            ->selectRaw('product_id, SUM(quantity) as total')
            ->pluck('total', 'product_id');

        $paginated->getCollection()->transform(function (Product $product) use ($stocks, $variantStocks): array {
            $stock = $product->has_variants
                ? (float) ($variantStocks->get($product->id, 0))
                : (float) ($stocks->get($product->id, 0));

            return $this->formatProduct($product, $stock);
        });

        return response()->json($paginated);
    }

    public function product(Request $request, int $id): JsonResponse
    {
        $companyId = $request->integer('company_id') ?: $this->defaultCompanyId();
        $warehouseId = $request->integer('warehouse_id') ?: $this->defaultWarehouseId();

        $now = now();

        $product = Product::query()
            ->where('id', $id)
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->with([
                'category:id,name,slug',
                'product_images' => fn ($q) => $q->orderBy('sort_order'),
                'product_variants' => fn ($q) => $q->where('is_active', true)->with([
                    'variant_attribute_values.product_attribute_value.product_attribute',
                    'stocks' => fn ($sq) => $sq->where('warehouse_id', $warehouseId),
                ]),
                'reviews' => fn ($q) => $q->where('status', 'approved')->latest()->limit(20),
                'offers' => fn ($q) => $q
                    ->where('is_active', true)
                    ->where(function ($sq) use ($now): void {
                        $sq->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
                    })
                    ->where(function ($sq) use ($now): void {
                        $sq->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
                    }),
            ])
            ->firstOrFail();

        // Base stock (no variant)
        $stock = (float) Stock::query()
            ->where('product_id', $id)
            ->where('warehouse_id', $warehouseId)
            ->whereNull('variant_id')
            ->sum('quantity');

        $data = $this->formatProduct($product, $stock);

        // Variants
        if ($product->has_variants && $product->product_variants->isNotEmpty()) {
            $offers = $product->offers ?? collect();
            $productBasePrice = (float) ($product->compare_price ?? $product->price);

            $data['variants'] = $product->product_variants->map(function (ProductVariant $variant) use ($offers, $productBasePrice): array {
                $variantStock = $variant->stocks->sum('quantity');
                $variantBase = (float) ($variant->price ?? $productBasePrice);
                $variantFinal = $this->applyBestOffer($offers, $variantBase);

                return [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
                    'price' => $variant->price,
                    'price_final' => $variantFinal,
                    'is_active' => $variant->is_active,
                    'stock' => (int) $variantStock,
                    'attributes' => $variant->variant_attribute_values->map(function ($vav): array {
                        return [
                            'attribute_id' => $vav->product_attribute_value->attribute_id,
                            'attribute' => $this->normalizeVariantAttributeName($vav->product_attribute_value->product_attribute->name),
                            'value_id' => $vav->attribute_value_id,
                            'value' => $this->normalizeVariantAttributeValue($vav->product_attribute_value->value),
                        ];
                    })->values()->all(),
                ];
            })->values()->all();
        }

        // Reviews summary
        $data['review_count'] = $product->reviews->count();
        $data['average_rating'] = $product->reviews->isNotEmpty()
            ? round($product->reviews->avg('rating'), 1)
            : null;

        return response()->json($data);
    }

    public function categories(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'image_url', 'parent_id']);

        return response()->json($categories);
    }

    public function brands(Request $request): JsonResponse
    {
        $companyId = $request->integer('company_id') ?: $this->defaultCompanyId();

        $brands = Product::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->whereNotNull('brand')
            ->where('brand', '!=', '')
            ->distinct()
            ->orderBy('brand')
            ->pluck('brand');

        return response()->json($brands);
    }

    public function trackCart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.name' => ['required', 'string'],
            'items.*.qty' => ['required', 'numeric', 'min:1'],
            'items.*.price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $cart = \App\Models\AbandonedCart::create([
            'company_id' => $this->defaultCompanyId(),
            'email' => strtolower(trim($validated['email'])),
            'cart_json' => $validated['items'],
        ]);

        \App\Jobs\SendAbandonedCartEmail::dispatch($cart->id)->delay(now()->addHour());

        return response()->json(['ok' => true]);
    }

    public function checkout(Request $request): JsonResponse
    {
        $companyId = $request->integer('company_id') ?: $this->defaultCompanyId();
        $warehouseId = $request->integer('warehouse_id') ?: $this->defaultWarehouseId();

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'customer_dni' => ['nullable', 'string', 'max:30'],
            'customer_cuit' => ['nullable', 'string', 'max:20'],
            'shipping_address' => ['nullable', 'string'],
            'shipping_city' => ['nullable', 'string', 'max:100'],
            'shipping_province' => ['nullable', 'string', 'max:100'],
            'shipping_postal' => ['nullable', 'string', 'max:10'],
            'shipping_method_type' => ['nullable', 'string', 'in:home_delivery,pickup_point,moto'],
            'pickup_point_id' => ['nullable', 'integer', 'exists:shipping_pickup_points,id'],
            'moto_company_id' => ['nullable', 'integer', 'exists:shipping_moto_companies,id'],
            'shipping_cost' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'coupon_code' => ['nullable', 'string'],
            'selected_payment_method' => ['nullable', 'string', 'in:mercadopago,bank_transfer,qr,cash'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.qty' => ['required', 'numeric', 'min:0.001'],
        ]);

        // Associate authenticated customer if available
        $customerId = auth('sanctum')->id();

        // Resolve coupon
        $coupon = null;
        $couponId = null;
        $discountAmount = 0.0;

        if (! empty($validated['coupon_code'])) {
            $coupon = Coupon::query()
                ->where('code', strtoupper(trim($validated['coupon_code'])))
                ->where('is_active', true)
                ->where(function ($q): void {
                    $q->whereNull('valid_from')->orWhere('valid_from', '<=', now());
                })
                ->where(function ($q): void {
                    $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
                })
                ->where(function ($q): void {
                    $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses');
                })
                ->first();

            // Check per-customer usage limit
            if ($coupon && $coupon->max_uses_per_customer && $customerId) {
                $customerUses = CouponUsage::query()
                    ->where('coupon_id', $coupon->id)
                    ->where('customer_id', $customerId)
                    ->count();

                if ($customerUses >= $coupon->max_uses_per_customer) {
                    $coupon = null; // Invalidate coupon silently — discount won't apply
                }
            }
        }

        // Build order items
        $orderItems = [];
        $subtotal = 0.0;
        $taxTotal = 0.0;
        $now = now();

        foreach ($validated['items'] as $item) {
            $product = Product::query()
                ->where('id', $item['product_id'])
                ->where('company_id', $companyId)
                ->where('is_active', true)
                ->with([
                    'offers' => fn ($q) => $q
                        ->where('is_active', true)
                        ->where(fn ($sq) => $sq->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
                        ->where(fn ($sq) => $sq->whereNull('ends_at')->orWhere('ends_at', '>=', $now)),
                ])
                ->first();

            if (! $product) {
                continue;
            }

            $variantId = $item['variant_id'] ?? null;

            // Apply the best active offer to the product base price
            $basePrice = (float) ($product->compare_price ?? $product->price);
            $unitPrice = $this->applyBestOffer($product->offers, $basePrice);
            $sku = $product->sku;

            if ($variantId) {
                $variant = ProductVariant::find($variantId);
                if ($variant && $variant->product_id === $product->id) {
                    $variantBase = (float) ($variant->price ?? $basePrice);
                    $unitPrice = $this->applyBestOffer($product->offers, $variantBase);
                    $sku = $variant->sku ?? $product->sku;
                }
            }

            $qty = (float) $item['qty'];
            // El precio ya incluye IVA — no se suma impuesto adicional
            $lineTotal = round($unitPrice * $qty, 2);

            $subtotal += $lineTotal;

            $orderItems[] = [
                'product_id' => $product->id,
                'variant_id' => $variantId,
                'product_name' => $product->name,
                'sku' => $sku,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'tax_rate' => 0,
                'discount' => 0,
                'total' => $lineTotal,
            ];
        }

        if (empty($orderItems)) {
            return response()->json(['message' => 'No hay productos válidos en el carrito.'], 422);
        }

        // Apply coupon discount
        if ($coupon) {
            $couponId = $coupon->id;

            if ($coupon->type === 'percentage') {
                $discountAmount = round($subtotal * $coupon->value / 100, 2);
            } else {
                $discountAmount = min((float) $coupon->value, $subtotal);
            }
        }

        $shippingCost = (float) ($validated['shipping_cost'] ?? 0);
        $total = max(0.0, round($subtotal - $discountAmount + $shippingCost, 2));

        // Create order
        $order = EcommerceOrder::create([
            'company_id' => $companyId,
            'customer_id' => $customerId,
            'guest_email' => $customerId ? null : strtolower(trim($validated['customer_email'])),
            'guest_dni' => preg_replace('/\D/', '', $validated['customer_dni'] ?? ''),
            'guest_cuit' => preg_replace('/\D/', '', $validated['customer_cuit'] ?? ''),
            'coupon_id' => $couponId,
            'order_number' => strtoupper(Str::random(3)).'-'.strtoupper(Str::random(6)),
            'status' => 'pending',
            'payment_status' => 'pending',
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'shipping_cost' => $shippingCost,
            'tax_amount' => 0,
            'total' => $total,
            'shipping_name' => $validated['customer_name'],
            'shipping_address' => $validated['shipping_address'] ?? null,
            'shipping_city' => $validated['shipping_city'] ?? null,
            'shipping_province' => $validated['shipping_province'] ?? null,
            'shipping_postal' => $validated['shipping_postal'] ?? null,
            'shipping_phone' => $validated['customer_phone'] ?? null,
            'shipping_method_type' => $validated['shipping_method_type'] ?? null,
            'pickup_point_id' => $validated['pickup_point_id'] ?? null,
            'moto_company_id' => $validated['moto_company_id'] ?? null,
            'customer_notes' => $validated['notes'] ?? null,
            'selected_payment_method' => $validated['selected_payment_method'] ?? null,
        ]);

        foreach ($orderItems as $item) {
            $order->ecommerce_order_items()->create($item);

            // Decrement stock immediately for non-MercadoPago orders.
            // MercadoPago orders will deduct stock at Webhook level to avoid reserving unpaid items.
            if (($validated['selected_payment_method'] ?? null) !== 'mercadopago') {
                Stock::query()
                    ->where('product_id', $item['product_id'])
                    ->where('warehouse_id', $warehouseId)
                    ->where('variant_id', $item['variant_id'])
                    ->when($item['variant_id'] === null, fn ($q) => $q->whereNull('variant_id'))
                    ->decrement('quantity', $item['quantity']);

                StockAlertService::checkAndNotify($item['product_id'], $item['variant_id'], $warehouseId);
            }
        }

        if ($coupon) {
            $coupon->increment('used_count');
            CouponUsage::create([
                'coupon_id' => $coupon->id,
                'customer_id' => $customerId,
                'order_id' => $order->id,
                'used_at' => now(),
            ]);
        }

        // CRM notification — new order
        CrmNotification::create([
            'type' => 'new_order',
            'title' => 'Nuevo pedido',
            'body' => "#{$order->order_number} · {$validated['customer_name']} · $".number_format($total, 0, ',', '.'),
            'url' => '/ecommerce-orders/'.$order->id,
            'order_code' => $order->order_number,
        ]);

        // Send order confirmation email (fire-and-forget — never fail the checkout)
        try {
            $order->load('ecommerce_order_items');
            Mail::to($validated['customer_email'])->send(
                new OrderConfirmed($order, $validated['customer_name'], $validated['customer_email'])
            );
        } catch (\Throwable) {
            // Email failure must not roll back the order
        }

        // Mark any pending abandoned cart for this email as recovered
        \App\Models\AbandonedCart::query()
            ->where('email', strtolower(trim($validated['customer_email'])))
            ->whereNull('recovered_at')
            ->update(['recovered_at' => now()]);

        if ($customerId) {
            try {
                if (($validated['selected_payment_method'] ?? null) !== 'mercadopago') {
                    \App\Jobs\SendWhatsAppNotification::dispatch(
                        $customerId,
                        $companyId,
                        'order_created',
                        [
                            ['type' => 'text', 'text' => $order->order_number],
                        ]
                    );
                }
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error('WA Job Error (Checkout): '.$e->getMessage());
            }
        }

        return response()->json([
            'code' => $order->order_number,
            'status' => $order->status,
            'pricing_mode' => 'b2c',
            'subtotal' => $subtotal,
            'tax_total' => $taxTotal,
            'total' => $total,
        ], 201);
    }

    public function order(Request $request, string $code): JsonResponse
    {
        $order = EcommerceOrder::query()
            ->where('order_number', $code)
            ->with(['ecommerce_order_items', 'shipments'])
            ->firstOrFail();

        $shipment = $order->shipments->first();

        return response()->json([
            'id' => $order->id,
            'code' => $order->order_number,
            'status' => $order->status,
            'payment_status' => $order->payment_status ?? 'pending',
            'shipping_method_type' => $order->shipping_method_type,
            'selected_payment_method' => $order->selected_payment_method,
            'pricing_mode' => 'b2c',
            'customer_name' => $order->shipping_name,
            'customer_email' => null,
            'customer_phone' => $order->shipping_phone,
            'shipping_name' => $order->shipping_name,
            'shipping_address' => $order->shipping_address,
            'shipping_city' => $order->shipping_city,
            'shipping_province' => $order->shipping_province,
            'shipping_postal' => $order->shipping_postal,
            'shipping_phone' => $order->shipping_phone,
            'customer_notes' => $order->customer_notes,
            'notes' => $order->customer_notes,
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'shipping_cost' => $order->shipping_cost,
            'tax_total' => $order->tax_amount,
            'tax_amount' => $order->tax_amount,
            'total' => $order->total,
            'currency' => 'ARS',
            'created_at' => $order->created_at?->toISOString(),
            'can_cancel' => false,
            'tracking' => $shipment ? [
                'carrier' => $shipment->carrier,
                'tracking_code' => $shipment->tracking_code,
                'tracking_url' => $shipment->tracking_url,
                'status' => $shipment->status,
                'shipped_at' => $shipment->shipped_at,
                'estimated_delivery' => $shipment->estimated_delivery,
                'delivered_at' => $shipment->delivered_at,
                'notes' => $shipment->notes,
            ] : null,
            'items' => $order->ecommerce_order_items->map(function (EcommerceOrderItem $item): array {
                $lineSubtotal = round($item->unit_price * $item->quantity, 2);
                $lineTax = round($lineSubtotal * (float) ($item->tax_rate ?? 0) / 100, 2);

                return [
                    'id' => $item->id,
                    'product_id' => $item->product_id,
                    'sku' => $item->sku,
                    'name' => $item->product_name,
                    'qty' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'tax_rate' => $item->tax_rate ?? 0,
                    'line_subtotal' => $lineSubtotal,
                    'line_tax' => $lineTax,
                    'line_total' => $item->total,
                    'total' => $item->total,
                ];
            })->values(),
        ]);
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
            'cart_total' => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::query()
            ->where('code', strtoupper(trim($request->string('code')->toString())))
            ->where('is_active', true)
            ->where(function ($q): void {
                $q->whereNull('valid_from')->orWhere('valid_from', '<=', now());
            })
            ->where(function ($q): void {
                $q->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->where(function ($q): void {
                $q->whereNull('max_uses')->orWhereColumn('used_count', '<', 'max_uses');
            })
            ->first();

        if (! $coupon) {
            return response()->json(['valid' => false, 'message' => 'Cupón inválido o expirado.']);
        }

        // Check per-customer usage limit for authenticated customers
        $customerId = auth('sanctum')->id();
        if ($coupon->max_uses_per_customer && $customerId) {
            $customerUses = CouponUsage::query()
                ->where('coupon_id', $coupon->id)
                ->where('customer_id', $customerId)
                ->count();

            if ($customerUses >= $coupon->max_uses_per_customer) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Ya alcanzaste el límite de usos de este cupón.',
                ]);
            }
        }

        $cartTotal = (float) $request->input('cart_total');

        if ($coupon->min_order_amount && $cartTotal < (float) $coupon->min_order_amount) {
            return response()->json([
                'valid' => false,
                'message' => 'El pedido no alcanza el monto mínimo para este cupón ($'.number_format($coupon->min_order_amount, 0, ',', '.').').',
            ]);
        }

        $discount = $coupon->type === 'percentage'
            ? round($cartTotal * (float) $coupon->value / 100, 2)
            : min((float) $coupon->value, $cartTotal);

        return response()->json([
            'valid' => true,
            'coupon' => [
                'id' => $coupon->id,
                'code' => $coupon->code,
                'type' => $coupon->type,
                'discount_value' => $coupon->value,
            ],
            'discount' => $discount,
            'final_total' => max(0.0, round($cartTotal - $discount, 2)),
        ]);
    }

    public function productStock(Request $request, int $id): JsonResponse
    {
        $warehouseId = $request->integer('warehouse_id') ?: $this->defaultWarehouseId();

        $stocks = Stock::query()
            ->where('product_id', $id)
            ->where('warehouse_id', $warehouseId)
            ->get(['product_id', 'variant_id', 'warehouse_id', 'quantity']);

        return response()->json($stocks);
    }

    public function offers(Request $request): JsonResponse
    {
        $companyId = $request->integer('company_id') ?: $this->defaultCompanyId();
        $now = now();

        $offers = Offer::query()
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->where(function ($q) use ($now): void {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now);
            })
            ->where(function ($q) use ($now): void {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now);
            })
            ->withCount('products')
            ->get(['id', 'name', 'type', 'value', 'badge_text', 'badge_color', 'description', 'ends_at']);

        return response()->json($offers);
    }

    /**
     * Apply the best offer discount to a base price.
     *
     * @param  \Illuminate\Support\Collection<int, \App\Models\Offer>  $offers
     */
    private function applyBestOffer(\Illuminate\Support\Collection $offers, float $basePrice): float
    {
        $finalPrice = $basePrice;

        foreach ($offers as $offer) {
            switch ($offer->type) {
                case 'discount_percent':
                    if ($offer->value !== null) {
                        $discounted = round($basePrice * (1 - (float) $offer->value / 100), 2);
                        if ($discounted < $finalPrice) {
                            $finalPrice = $discounted;
                        }
                    }
                    break;
                case 'discount_fixed':
                    if ($offer->value !== null) {
                        $discounted = max(0.0, round($basePrice - (float) $offer->value, 2));
                        if ($discounted < $finalPrice) {
                            $finalPrice = $discounted;
                        }
                    }
                    break;
                case 'combo':
                    if ($offer->value !== null && (float) $offer->value < $finalPrice) {
                        $finalPrice = (float) $offer->value;
                    }
                    break;
            }
        }

        return $finalPrice;
    }

    /** @return array<string, mixed> */
    private function formatProduct(Product $product, float $stock): array
    {
        $images = $product->product_images?->map(fn ($img): array => [
            'id' => $img->id,
            'url' => $img->url,
            'alt' => $img->alt,
            'sort_order' => $img->sort_order,
            'is_primary' => $img->is_cover,
        ])->values()->all() ?? [];

        $primaryImage = $product->product_images?->firstWhere('is_cover', true)?->url
            ?? $product->product_images?->first()?->url;

        $offers = $product->offers ?? collect();

        // List price (shown with strikethrough when a discount applies)
        $listPrice = (float) $product->price;
        // Starting price for offer calculations (compare_price may already be a manual sale price)
        $startPrice = (float) ($product->compare_price ?? $product->price);

        // Apply the best discount from all active offers
        $finalPrice = $this->applyBestOffer($offers, $startPrice);

        $offersData = $offers->map(fn ($o): array => [
            'id' => $o->id,
            'badge_text' => $o->badge_text,
            'badge_color' => $o->badge_color,
            'type' => $o->type,
            'value' => $o->value,
            'description' => $o->description,
            'ends_at' => $o->ends_at?->toIso8601String(),
        ])->values()->all();

        return [
            'id' => $product->id,
            'company_id' => $product->company_id,
            'category_id' => $product->category_id,
            'sku' => $product->sku,
            'barcode' => $product->barcode,
            'name' => $product->name,
            'description' => $product->description,
            'unit' => null,
            'cost' => $product->cost_price ?? 0,
            'price' => $listPrice,
            'price_final' => $finalPrice,
            'tax_rate' => $product->tax_rate ?? 0,
            'tax_id' => $product->tax_id,
            'is_active' => $product->is_active,
            'track_stock' => $product->track_stock,
            'min_stock' => 0,
            'has_variants' => $product->has_variants ?? false,
            'stock' => (int) $stock,
            'primary_image_url' => $primaryImage,
            'images' => $images,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
            ] : null,
            'offers' => $offersData,
            'offer' => $offersData[0] ?? null,
        ];
    }
}
