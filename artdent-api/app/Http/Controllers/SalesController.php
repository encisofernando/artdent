<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\Customer;

class SalesController extends Controller
{
    /**
     * Listar ventas con paginación y filtros
     */
    public function index(Request $request)
    {
        $cid = $request->user()->company_id;

        $query = Sale::where('company_id', $cid)
            ->with(['customer', 'items.product']);

        // Filtros
        if ($search = $request->get('q')) {
            $query->where(function($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhereHas('customer', function($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('from_date')) {
            $query->whereDate('sale_date', '>=', $request->get('from_date'));
        }

        if ($request->filled('to_date')) {
            $query->whereDate('sale_date', '<=', $request->get('to_date'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->get('customer_id'));
        }

        $perPage = min(max((int)($request->get('per_page') ?? 25), 1), 100);

        return $query->orderBy('id', 'desc')->paginate($perPage);
    }

    /**
     * Crear nueva venta con ítems
     */
    public function store(Request $request)
    {
        $cid = $request->user()->company_id;

        $data = $request->validate([
            'warehouse_id' => 'required|integer',
            'customer_id' => 'nullable|integer',
            'sale_date' => 'nullable|date',
            'observations' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'payment_reference' => 'nullable|string',

            // Items
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.qty' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            // Validar warehouse
            $warehouse = \App\Models\Warehouse::where('company_id', $cid)
                ->where('id', $data['warehouse_id'])
                ->firstOrFail();

            // Validar customer si existe
            if ($data['customer_id'] ?? null) {
                Customer::where('company_id', $cid)
                    ->where('id', $data['customer_id'])
                    ->firstOrFail();
            }

            // Calcular totales
            $subtotal = 0;
            $taxTotal = 0;
            $discountTotal = 0;

            $itemsData = [];
            foreach ($data['items'] as $item) {
                $qty = (float) $item['qty'];
                $unitPrice = (float) $item['unit_price'];
                $discount = (float) ($item['discount'] ?? 0);
                $taxRate = (float) ($item['tax_rate'] ?? 0);

                // Validar stock disponible
                $product = Product::findOrFail($item['product_id']);
                if ($product->track_stock) {
                    $currentStock = Stock::where('company_id', $cid)
                        ->where('warehouse_id', $data['warehouse_id'])
                        ->where('product_id', $item['product_id'])
                        ->value('qty') ?? 0;

                    if ($currentStock < $qty) {
                        throw new \Exception(
                            "Stock insuficiente para {$product->name}. Disponible: {$currentStock}, Solicitado: {$qty}"
                        );
                    }
                }

                // Calcular línea
                $lineSubtotal = $qty * $unitPrice;
                $lineDiscount = $discount;
                $lineBase = $lineSubtotal - $lineDiscount;

                // Si el precio ya incluye IVA, extraemos el impuesto
                $lineTax = 0;
                if ($taxRate > 0) {
                    $lineNeto = $lineBase / (1 + ($taxRate / 100));
                    $lineTax = $lineBase - $lineNeto;
                }

                $lineTotal = $lineBase;

                $subtotal += $lineSubtotal;
                $discountTotal += $lineDiscount;
                $taxTotal += $lineTax;

                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'description' => $product->name,
                    'qty' => $qty,
                    'unit_price' => $unitPrice,
                    'discount' => $lineDiscount,
                    'tax_rate' => $taxRate,
                    'tax_amount' => $lineTax,
                    'line_total' => $lineTotal,
                ];
            }

            $total = $subtotal - $discountTotal;

            // ✅ Generar número de comprobante (formato: 00001-00000001)
            // Punto de venta: idealmente debería venir de sucursal/almacén (point_of_sale).
            // Si no existe, usamos 1 (=> 00001).
            $ptoVta = (int) data_get($warehouse, 'point_of_sale', 0);
            if ($ptoVta <= 0) {
                $ptoVta = 1;
            }

            // Evitar duplicados en concurrencia
            $lastSale = Sale::where('company_id', $cid)
                ->where('warehouse_id', $data['warehouse_id'])
                ->lockForUpdate()
                ->orderBy('id', 'desc')
                ->first();

            $lastTicket = 0;
            if ($lastSale && is_string($lastSale->number)) {
                // Acepta formatos antiguos (V00000001) y nuevos (00001-00000001)
                if (str_contains($lastSale->number, '-')) {
                    $parts = explode('-', $lastSale->number);
                    $lastTicket = (int) end($parts);
                } else {
                    $lastTicket = (int) preg_replace('/\D+/', '', $lastSale->number);
                }
            }

            $nextTicket = $lastTicket + 1;
            $number = sprintf('%05d-%08d', $ptoVta, $nextTicket);

            // Crear venta
            $sale = Sale::create([
                'company_id' => $cid,
                'warehouse_id' => $data['warehouse_id'],
                'cashier_id' => $request->user()->id,
                'customer_id' => $data['customer_id'] ?? null,
                'number' => $number, // ✅ ahora ya queda con el formato correcto
                'status' => 'confirmed',
                'sale_date' => $data['sale_date'] ?? now(),
                'subtotal' => $subtotal,
                'discount_total' => $discountTotal,
                'tax_total' => $taxTotal,
                'total' => $total,
                'observations' => $data['observations'] ?? null,
            ]);

            // Crear ítems y descontar stock
            foreach ($itemsData as $itemData) {
                $saleItem = SaleItem::create([
                    'sale_id' => $sale->id,
                    ...$itemData,
                ]);

                $product = Product::find($itemData['product_id']);
                if ($product->track_stock) {
                    $stock = Stock::firstOrCreate(
                        [
                            'company_id' => $cid,
                            'warehouse_id' => $data['warehouse_id'],
                            'product_id' => $itemData['product_id'],
                        ],
                        ['qty' => 0]
                    );

                    $newQty = $stock->qty - $itemData['qty'];

                    if ($newQty < 0) {
                        throw new \Exception("Error en el cálculo de stock para {$product->name}");
                    }

                    $stock->update(['qty' => $newQty]);

                    StockMovement::create([
                        'company_id' => $cid,
                        'warehouse_id' => $data['warehouse_id'],
                        'product_id' => $itemData['product_id'],
                        'movement_date' => now(),
                        'type' => 'out',
                        'qty' => $itemData['qty'],
                        'reference_type' => 'sale_item',
                        'reference_id' => $saleItem->id,
                        'note' => "Venta #{$sale->number}",
                    ]);
                }
            }

            DB::commit();

            $sale->load(['items.product', 'customer']);

            return response()->json($sale, 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error al crear la venta: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Obtener detalle de una venta
     */
    public function show(Request $request, Sale $sale)
    {
        $cid = $request->user()->company_id;

        abort_unless($sale->company_id == $cid, 403, 'Forbidden');

        $sale->load(['items.product', 'customer', 'cashier']);

        return $sale;
    }

    /**
     * Cancelar una venta (revierte stock)
     */
    public function cancel(Request $request, Sale $sale)
    {
        $cid = $request->user()->company_id;

        abort_unless($sale->company_id == $cid, 403, 'Forbidden');

        if ($sale->status === 'cancelled') {
            return response()->json(['message' => 'La venta ya está cancelada'], 422);
        }

        DB::beginTransaction();
        try {
            // Revertir stock
            foreach ($sale->items as $item) {
                $product = $item->product;

                if ($product->track_stock) {
                    $stock = Stock::firstOrCreate(
                        [
                            'company_id' => $cid,
                            'warehouse_id' => $sale->warehouse_id,
                            'product_id' => $item->product_id,
                        ],
                        ['qty' => 0]
                    );

                    $stock->increment('qty', $item->qty);

                    // Registrar movimiento de reversión
                    StockMovement::create([
                        'company_id' => $cid,
                        'warehouse_id' => $sale->warehouse_id,
                        'product_id' => $item->product_id,
                        'movement_date' => now(),
                        'type' => 'in',
                        'qty' => $item->qty,
                        'reference_type' => 'sale_cancellation',
                        'reference_id' => $sale->id,
                        'note' => "Cancelación de venta #{$sale->number}",
                    ]);
                }
            }

            $sale->update(['status' => 'cancelled']);

            DB::commit();

            return response()->json(['message' => 'Venta cancelada exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error al cancelar la venta: ' . $e->getMessage()
            ], 422);
        }
    }

    /**
     * Estadísticas de ventas
     */
    public function stats(Request $request)
    {
        $cid = $request->user()->company_id;

        $today = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'today' => [
                'count' => Sale::where('company_id', $cid)
                    ->where('status', 'confirmed')
                    ->whereDate('sale_date', '>=', $today)
                    ->count(),
                'total' => Sale::where('company_id', $cid)
                    ->where('status', 'confirmed')
                    ->whereDate('sale_date', '>=', $today)
                    ->sum('total'),
            ],
            'this_month' => [
                'count' => Sale::where('company_id', $cid)
                    ->where('status', 'confirmed')
                    ->whereDate('sale_date', '>=', $thisMonth)
                    ->count(),
                'total' => Sale::where('company_id', $cid)
                    ->where('status', 'confirmed')
                    ->whereDate('sale_date', '>=', $thisMonth)
                    ->sum('total'),
            ],
        ];

        return response()->json($stats);
    }

    /**
     * Registrar recibos/cobros para una venta (bulk)
     *
     * POST /api/sales/{sale}/receipts
     * Body: { receipts: [{ payment_method_id, amount, receipt_date, reference }] }
     */
    public function receipts(Request $request, Sale $sale)
    {
        $cid = $request->user()->company_id;

        abort_unless($sale->company_id == $cid, 403, 'Forbidden');

        $data = $request->validate([
            'receipts'                        => 'required|array|min:1',
            'receipts.*.payment_method_id'    => 'nullable|integer|exists:payment_methods,id',
            'receipts.*.amount'               => 'required|numeric|min:0',
            'receipts.*.receipt_date'         => 'nullable|date',
            'receipts.*.reference'            => 'nullable|string|max:191',
        ]);

        $created = [];
        foreach ($data['receipts'] as $r) {
            $created[] = \App\Models\Receipt::create([
                'company_id'        => $cid,
                'sale_id'           => $sale->id,
                'payment_method_id' => $r['payment_method_id'] ?? null,
                'amount'            => $r['amount'],
                'receipt_date'      => $r['receipt_date'] ?? now(),
                'reference'         => $r['reference'] ?? null,
            ]);
        }

        return response()->json($created, 201);
    }
}
