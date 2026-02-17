<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CatalogController extends Controller
{
    /**
     * POST /api/catalog/checkout
     *
     * Body (según frontend e-commerce):
     * - company_id?: number
     * - warehouse_id?: number
     * - customer_name: string
     * - customer_email: string
     * - customer_phone?: string
     * - shipping_address?: string
     * - notes?: string
     * - items: [{product_id, qty}]
     */
    public function checkout(Request $r)
    {
        $data = $r->validate([
            'company_id' => 'sometimes|integer',
            'warehouse_id' => 'sometimes|nullable|integer',
            'customer_name' => 'required|string|max:191',
            'customer_email' => 'required|email|max:191',
            'customer_phone' => 'sometimes|nullable|string|max:64',
            'shipping_address' => 'sometimes|nullable|string',
            'notes' => 'sometimes|nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|numeric|min:0.001',
        ]);

        // Si no viene, caemos en la primera company (modo demo) pero si tenés multi-empresa,
        // el e-commerce debería enviar company_id.
        $companyId = (int)($data['company_id'] ?? 1);

        $order = DB::transaction(function () use ($data, $companyId) {
            $code = $this->generateCode();

            $order = EcommerceOrder::create([
                'company_id' => $companyId,
                'warehouse_id' => $data['warehouse_id'] ?? null,
                'user_id' => null,
                'code' => $code,
                'status' => 'pending',
                'pricing_mode' => 'b2c',
                'customer_name' => $data['customer_name'],
                'customer_email' => $data['customer_email'],
                'customer_phone' => $data['customer_phone'] ?? null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'notes' => $data['notes'] ?? null,
                'subtotal' => 0,
                'tax_total' => 0,
                'total' => 0,
                'currency' => 'ARS',
            ]);

            $productIds = collect($data['items'])->pluck('product_id')->unique()->values()->all();
            $products = Product::query()
                ->where('company_id', $companyId)
                ->whereIn('id', $productIds)
                ->get(['id','sku','name','price','tax_rate'])
                ->keyBy('id');

            $subtotal = 0.0;
            $taxTotal = 0.0;

            foreach ($data['items'] as $it) {
                $p = $products->get($it['product_id']);
                if (!$p) {
                    abort(422, 'Producto no encontrado: ' . (int)$it['product_id']);
                }

                $qty = (float)$it['qty'];
                $unit = (float)$p->price;
                $rate = (float)($p->tax_rate ?? 0);

                $lineSubtotal = round($qty * $unit, 2);
                $lineTax = round($lineSubtotal * ($rate / 100), 2);
                $lineTotal = $lineSubtotal + $lineTax;

                $subtotal += $lineSubtotal;
                $taxTotal += $lineTax;

                EcommerceOrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $p->id,
                    'sku' => $p->sku,
                    'name' => $p->name,
                    'qty' => $qty,
                    'unit_price' => $unit,
                    'tax_rate' => $rate,
                    'line_subtotal' => $lineSubtotal,
                    'line_tax' => $lineTax,
                    'line_total' => $lineTotal,
                ]);
            }

            $order->update([
                'subtotal' => round($subtotal, 2),
                'tax_total' => round($taxTotal, 2),
                'total' => round($subtotal + $taxTotal, 2),
            ]);

            return $order;
        });

        return response()->json([
            'code' => $order->code,
            'status' => $order->status,
            'pricing_mode' => $order->pricing_mode,
            'subtotal' => (float)$order->subtotal,
            'tax_total' => (float)$order->tax_total,
            'total' => (float)$order->total,
        ], 201);
    }

    /**
     * GET /api/catalog/orders/{code}
     * Params: email?: string, company_id?: number
     */
    public function getOrder(Request $r, string $code)
    {
        $companyId = (int)($r->input('company_id', 1));
        $email = $r->input('email');

        $q = EcommerceOrder::query()
            ->where('company_id', $companyId)
            ->where('code', $code)
            ->with('items');

        if ($email) {
            $q->where('customer_email', $email);
        }

        $order = $q->firstOrFail();

        return response()->json($order);
    }

    private function generateCode(): string
    {
        // Ej: AD-20260213-7F2K9Q
        return 'AD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(6));
    }
}
