<?php

namespace App\Http\Controllers\Catalog;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderItem;
use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Services\PricingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutController extends Controller
{
    public function checkout(Request $request, PricingService $pricing)
    {
        $companyId = (int) ($request->input('company_id') ?? env('ECOMMERCE_COMPANY_ID', 1));
        $warehouseId = $request->input('warehouse_id') !== null
            ? (int) $request->input('warehouse_id')
            : (int) env('ECOMMERCE_WAREHOUSE_ID', 1);

        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:191'],
            'customer_email' => ['required', 'email', 'max:191'],
            'customer_phone' => ['nullable', 'string', 'max:64'],
            'shipping_address' => ['nullable', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'numeric', 'min:0.001'],
        ]);

        $user = $request->user(); // puede ser null (guest)
        $company = Company::query()->findOrFail($companyId);

        return DB::transaction(function () use ($validated, $companyId, $warehouseId, $user, $company, $pricing) {
            // Traer productos y validar que existan y pertenezcan a la empresa
            $productIds = collect($validated['items'])->pluck('product_id')->map(fn ($v) => (int) $v)->unique()->values();
            $products = Product::query()
                ->where('company_id', $companyId)
                ->whereIn('id', $productIds)
                ->where('is_active', 1)
                ->get()
                ->keyBy('id');

            if ($products->count() !== $productIds->count()) {
                return response()->json(['message' => 'Hay productos inválidos o inactivos en el carrito.'], 422);
            }

            // Validar stock (bloqueo row-level) si el producto trackea stock
            foreach ($validated['items'] as $line) {
                $pid = (int) $line['product_id'];
                $qty = (float) $line['qty'];
                $product = $products[$pid];

                if ((int) $product->track_stock === 1) {
                    $stock = Stock::query()
                        ->where('company_id', $companyId)
                        ->where('warehouse_id', $warehouseId)
                        ->where('product_id', $pid)
                        ->lockForUpdate()
                        ->first();

                    $available = $stock ? (float) $stock->qty : 0.0;
                    if ($available < $qty) {
                        return response()->json([
                            'message' => 'Stock insuficiente.',
                            'product_id' => $pid,
                            'available' => $available,
                            'requested' => $qty,
                        ], 409);
                    }
                }
            }

            // Crear orden
            $code = $this->generateCode($companyId);
            $pricingMode = (!$user || ($user->pricing_mode ?? 'b2c') !== 'b2b') ? 'b2c' : 'b2b';

            $order = EcommerceOrder::query()->create([
                'company_id' => $companyId,
                'warehouse_id' => $warehouseId,
                'user_id' => $user?->id,
                'code' => $code,
                'status' => 'pending',
                'pricing_mode' => $pricingMode,
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'] ?? null,
                'shipping_address' => $validated['shipping_address'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'subtotal' => 0,
                'tax_total' => 0,
                'total' => 0,
                'currency' => 'ARS',
            ]);

            $subtotal = 0.0;
            $taxTotal = 0.0;

            foreach ($validated['items'] as $line) {
                $pid = (int) $line['product_id'];
                $qty = (float) $line['qty'];
                $product = $products[$pid];

                $p = $pricing->priceFor($product, $user, $company);
                $unitPrice = (float) $p['final'];
                $taxRate = (float) ($product->tax_rate ?? 0);
                $lineSubtotal = round($qty * $unitPrice, 2);
                $lineTax = round($lineSubtotal * ($taxRate / 100), 2);
                $lineTotal = round($lineSubtotal + $lineTax, 2);

                EcommerceOrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'sku' => $product->sku,
                    'name' => $product->name,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'tax_rate' => $taxRate,
                    'line_subtotal' => $lineSubtotal,
                    'line_tax' => $lineTax,
                    'line_total' => $lineTotal,
                ]);

                $subtotal += $lineSubtotal;
                $taxTotal += $lineTax;

                // Descontar stock + movimiento
                if ((int) $product->track_stock === 1) {
                    $stock = Stock::query()
                        ->where('company_id', $companyId)
                        ->where('warehouse_id', $warehouseId)
                        ->where('product_id', $product->id)
                        ->lockForUpdate()
                        ->first();

                    if (!$stock) {
                        // Por consistencia, si track_stock=1 debe existir fila, pero si no existe la creamos en 0.
                        $stock = Stock::query()->create([
                            'company_id' => $companyId,
                            'warehouse_id' => $warehouseId,
                            'product_id' => $product->id,
                            'qty' => 0,
                        ]);
                    }

                    $stock->qty = round(((float) $stock->qty) - $qty, 3);
                    $stock->save();

                    StockMovement::query()->create([
                        'company_id' => $companyId,
                        'warehouse_id' => $warehouseId,
                        'product_id' => $product->id,
                        'movement_date' => now(),
                        'type' => 'out',
                        'qty' => $qty,
                        'reference_type' => 'ecommerce_order',
                        'reference_id' => $order->id,
                    ]);
                }
            }

            $total = round($subtotal + $taxTotal, 2);
            $order->subtotal = round($subtotal, 2);
            $order->tax_total = round($taxTotal, 2);
            $order->total = $total;
            $order->save();

            return response()->json([
                'code' => $order->code,
                'status' => $order->status,
                'pricing_mode' => $order->pricing_mode,
                'subtotal' => $order->subtotal,
                'tax_total' => $order->tax_total,
                'total' => $order->total,
            ], 201);
        });
    }

    private function generateCode(int $companyId): string
    {
        // EC-<companyId>-YYYYMMDD-XXXXXX
        $date = now()->format('Ymd');
        $rand = strtoupper(Str::random(6));
        return "EC-{$companyId}-{$date}-{$rand}";
    }
}
