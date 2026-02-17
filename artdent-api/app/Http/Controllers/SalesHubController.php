<?php

namespace App\Http\Controllers;

use App\Models\EcommerceOrder;
use App\Models\Receipt;
use App\Models\Sale;
use App\Services\StockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesHubController extends Controller
{
    /**
     * GET /api/sales-hub
     * source: pos|ecom|null
     */
    public function index(Request $r)
    {
        $cid = $r->user()->company_id;
        $source = $r->input('source');
        $status = $r->input('status');
        $search = trim((string)$r->input('search', ''));
        $from = $r->input('from');
        $to = $r->input('to');

        $perPage = (int)($r->input('per_page', 25));
        $perPage = max(1, min(200, $perPage));
        $page = (int)($r->input('page', 1));
        $page = max(1, $page);

        $rows = [];

        if (!$source || $source === 'pos') {
            $q = Sale::query()->where('company_id', $cid)
                ->with(['customer:id,name,email,phone'])
                ->withCount('items');

            if ($status) $q->where('status', $status);
            if ($from) $q->where('sale_date', '>=', $from);
            if ($to) $q->where('sale_date', '<=', $to);
            if ($search !== '') {
                $q->where(function ($qq) use ($search) {
                    $qq->where('number', 'like', "%{$search}%")
                        ->orWhere('id', $search)
                        ->orWhereHas('customer', fn($c) => $c->where('name','like',"%{$search}%"));
                });
            }

            foreach ($q->orderByDesc('sale_date')->limit(500)->get() as $s) {
                $paid = (float) Receipt::query()->where('company_id',$cid)->where('sale_id',$s->id)->sum('amount');
                $rows[] = [
                    'source' => 'pos',
                    'id' => $s->id,
                    'code' => $s->number ?? (string)$s->id,
                    'status' => $s->status,
                    'date' => $s->sale_date,
                    'customer' => $s->customer ? [
                        'name' => $s->customer->name,
                        'email' => $s->customer->email,
                        'phone' => $s->customer->phone,
                    ] : null,
                    'subtotal' => (float)$s->subtotal,
                    'tax_total' => (float)$s->tax_total,
                    'total' => (float)$s->total,
                    'paid_total' => round($paid,2),
                    'due_total' => round(max(0,(float)$s->total-$paid),2),
                    'items_count' => (int)$s->items_count,
                    'currency' => $s->currency ?? 'ARS',
                ];
            }
        }

        if (!$source || $source === 'ecom') {
            $q = EcommerceOrder::query()->where('company_id', $cid)->withCount('items');
            if ($status) $q->where('status', $status);
            if ($from) $q->where('created_at', '>=', $from);
            if ($to) $q->where('created_at', '<=', $to);
            if ($search !== '') {
                $q->where(function ($qq) use ($search) {
                    $qq->where('code', 'like', "%{$search}%")
                        ->orWhere('id', $search)
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%");
                });
            }

            foreach ($q->orderByDesc('created_at')->limit(500)->get() as $o) {
                $paid = 0.0; // receipts no soporta ecommerce_order_id aún
                $rows[] = [
                    'source' => 'ecom',
                    'id' => $o->id,
                    'code' => $o->code,
                    'status' => $o->status,
                    'date' => $o->created_at,
                    'customer' => [
                        'name' => $o->customer_name,
                        'email' => $o->customer_email,
                        'phone' => $o->customer_phone,
                    ],
                    'subtotal' => (float)$o->subtotal,
                    'tax_total' => (float)$o->tax_total,
                    'total' => (float)$o->total,
                    'paid_total' => round($paid,2),
                    'due_total' => round(max(0,(float)$o->total-$paid),2),
                    'items_count' => (int)$o->items_count,
                    'currency' => $o->currency ?? 'ARS',
                    'shipping_address' => $o->shipping_address,
                ];
            }
        }

        usort($rows, fn($a,$b) => strcmp((string)$b['date'], (string)$a['date']));

        $total = count($rows);
        $start = ($page - 1) * $perPage;
        $slice = array_slice($rows, $start, $perPage);

        return response()->json([
            'data' => $slice,
            'meta' => [
                'total' => $total,
                'per_page' => $perPage,
                'current_page' => $page,
                'last_page' => (int)ceil($total / $perPage),
            ]
        ]);
    }

    public function show(Request $r, string $source, int $id)
    {
        $cid = $r->user()->company_id;
        if ($source === 'pos') {
            $sale = Sale::query()->where('company_id',$cid)->where('id',$id)
                ->with(['items.product:id,sku,name','customer:id,name,email,phone,document'])
                ->firstOrFail();
            $receipts = Receipt::query()->where('company_id',$cid)->where('sale_id',$sale->id)->orderBy('id')->get();
            return response()->json([
                'source' => 'pos',
                'sale' => $sale,
                'receipts' => $receipts,
            ]);
        }

        if ($source === 'ecom') {
            $order = EcommerceOrder::query()->where('company_id',$cid)->where('id',$id)->with('items')->firstOrFail();
            $receipts = collect(); // no hay recibos ligados a ecommerce sin ecommerce_order_id
            return response()->json([
                'source' => 'ecom',
                'order' => $order,
                'receipts' => $receipts,
            ]);
        }

        return response()->json(['message' => 'source inválido'], 422);
    }

    public function cancel(Request $r, string $source, int $id, StockService $stock)
    {
        $cid = $r->user()->company_id;
        if ($source === 'pos') {
            $sale = Sale::where('company_id',$cid)->where('id',$id)->with('items')->firstOrFail();
            app(SalesController::class)->cancel($r, $sale, $stock);
            return response()->json(['ok' => true]);
        }

        if ($source === 'ecom') {
            $order = EcommerceOrder::where('company_id',$cid)->where('id',$id)->firstOrFail();
            $order->update(['status' => 'cancelled']);
            return response()->json(['ok' => true]);
        }

        return response()->json(['message' => 'source inválido'], 422);
    }

    public function update(Request $r, string $source, int $id)
    {
        $cid = $r->user()->company_id;
        if ($source === 'pos') {
            $sale = Sale::where('company_id',$cid)->where('id',$id)->firstOrFail();
            $data = $r->validate([
                'observations' => 'sometimes|nullable|string',
                'status' => 'sometimes|in:draft,confirmed,invoiced,cancelled',
                'customer_id' => 'sometimes|nullable|integer',
            ]);
            $sale->update($data);
            return response()->json($sale->fresh());
        }

        if ($source === 'ecom') {
            $order = EcommerceOrder::where('company_id',$cid)->where('id',$id)->firstOrFail();
            $data = $r->validate([
                'status' => 'sometimes|string|max:32',
                'shipping_address' => 'sometimes|nullable|string',
                'notes' => 'sometimes|nullable|string',
            ]);
            $order->update($data);
            return response()->json($order->fresh());
        }

        return response()->json(['message' => 'source inválido'], 422);
    }
}
