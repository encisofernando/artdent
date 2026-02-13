<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductsController extends Controller
{
    /**
     * Crear un producto con stock inicial
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:191',
            'sku' => 'nullable|string|max:64',
            'barcode' => 'nullable|string|max:64',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:16',
            'category_id' => 'nullable|integer',
            'vendor_id' => 'nullable|integer',
            'cost' => 'nullable|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'tax_id' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock' => 'nullable|integer|min:0',
            'initial_stock' => 'nullable|integer|min:0', // 👈 NUEVO
        ]);

        $data['company_id'] = $request->user()->company_id;
        $data['cost'] = $data['cost'] ?? 0;
        $data['tax_rate'] = $data['tax_rate'] ?? 0;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['track_stock'] = $data['track_stock'] ?? true;
        $data['min_stock'] = $data['min_stock'] ?? 0;

        DB::beginTransaction();
        try {
            // Crear el producto
            $initialStock = $data['initial_stock'] ?? 0;
            unset($data['initial_stock']); // No guardar en tabla products
            
            $product = Product::create($data);

            // Si hay stock inicial y se controla stock
            if ($initialStock > 0 && ($data['track_stock'] ?? true)) {
                // Obtener almacén por defecto (o el primero disponible)
                $warehouse = \App\Models\Warehouse::where('company_id', $data['company_id'])
                    ->where('is_default', true)
                    ->first();
                
                if (!$warehouse) {
                    $warehouse = \App\Models\Warehouse::where('company_id', $data['company_id'])->first();
                }

                if ($warehouse) {
                    // Crear registro de stock
                    Stock::create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id,
                        'quantity' => $initialStock,
                    ]);

                    // Registrar movimiento de stock (opcional pero recomendado)
                    StockMovement::create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id,
                        'type' => 'in',
                        'quantity' => $initialStock,
                        'reason' => 'Stock inicial al crear producto',
                        'user_id' => $request->user()->id,
                        'date' => now(),
                    ]);
                }
            }

            DB::commit();

            // Cargar relación de stock para la respuesta
            $product->load('stock');

            return response()->json($product, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Actualizar producto con ajuste de stock
     */
    public function update(Request $request, Product $product)
    {
        // Autorizar que el producto pertenece a la empresa del usuario
        $this->authorizeProduct($request, $product);

        $data = $request->validate([
            'name' => 'sometimes|string|max:191',
            'sku' => 'sometimes|nullable|string|max:64',
            'barcode' => 'sometimes|nullable|string|max:64',
            'description' => 'sometimes|nullable|string',
            'unit' => 'sometimes|nullable|string|max:16',
            'category_id' => 'sometimes|nullable|integer',
            'vendor_id' => 'sometimes|nullable|integer',
            'cost' => 'sometimes|nullable|numeric|min:0',
            'price' => 'sometimes|numeric|min:0',
            'tax_rate' => 'sometimes|nullable|numeric|min:0',
            'tax_id' => 'sometimes|nullable|integer',
            'is_active' => 'sometimes|boolean',
            'track_stock' => 'sometimes|boolean',
            'min_stock' => 'sometimes|integer|min:0',
            'stock_adjustment' => 'sometimes|integer', // 👈 NUEVO: puede ser positivo o negativo
        ]);

        DB::beginTransaction();
        try {
            // Extraer ajuste de stock si existe
            $stockAdjustment = $data['stock_adjustment'] ?? null;
            unset($data['stock_adjustment']); // No guardar en tabla products

            // Actualizar el producto
            $product->update($data);

            // Procesar ajuste de stock si existe
            if ($stockAdjustment !== null && $stockAdjustment != 0) {
                // Obtener almacén por defecto
                $warehouse = \App\Models\Warehouse::where('company_id', $product->company_id)
                    ->where('is_default', true)
                    ->first();
                
                if (!$warehouse) {
                    $warehouse = \App\Models\Warehouse::where('company_id', $product->company_id)->first();
                }

                if (!$warehouse) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'No se encontró un almacén para ajustar el stock'
                    ], 422);
                }

                // Buscar o crear registro de stock
                $stock = Stock::firstOrCreate(
                    [
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouse->id,
                    ],
                    ['quantity' => 0]
                );

                // Calcular nuevo stock
                $newQuantity = $stock->quantity + $stockAdjustment;

                // Validar que no quede negativo
                if ($newQuantity < 0) {
                    DB::rollBack();
                    return response()->json([
                        'message' => "El ajuste de stock ($stockAdjustment) resultaría en stock negativo. Stock actual: {$stock->quantity}"
                    ], 422);
                }

                // Actualizar cantidad
                $stock->update(['quantity' => $newQuantity]);

                // Registrar el movimiento
                StockMovement::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouse->id,
                    'type' => $stockAdjustment > 0 ? 'in' : 'out',
                    'quantity' => abs($stockAdjustment),
                    'reason' => 'Ajuste manual desde CRM',
                    'user_id' => $request->user()->id,
                    'date' => now(),
                    'notes' => "Ajuste: " . ($stockAdjustment > 0 ? '+' : '') . $stockAdjustment,
                ]);
            }

            DB::commit();

            // Cargar relaciones para la respuesta
            $product->load('stock');

            return response()->json($product);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Listar productos con stock
     */
    public function index(Request $request)
    {
        $cid = $request->user()->company_id ?? null;
        $q = Product::query();
        
        if ($cid) {
            $q->where('company_id', $cid);
        }

        if ($search = $request->get('q')) {
            $q->where(function($w) use($search) {
                $w->where('name', 'like', "%$search%")
                  ->orWhere('sku', 'like', "%$search%")
                  ->orWhere('barcode', 'like', "%$search%");
            });
        }

        if ($request->filled('category_id')) {
            $q->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('is_active')) {
            $q->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        // Cargar stock total
        $q->with(['stock' => function($query) {
            $query->selectRaw('product_id, SUM(quantity) as total_stock')
                  ->groupBy('product_id');
        }]);

        $perPage = min(max((int)($request->get('per_page') ?? 25), 1), 100);
        $products = $q->orderBy('id', 'desc')->paginate($perPage);

        // Agregar stock a cada producto en la respuesta
        $products->getCollection()->transform(function ($product) {
            $product->stock = $product->stock->sum('total_stock') ?? 0;
            return $product;
        });

        return $products;
    }

    /**
     * Verificar que el producto pertenece a la empresa del usuario
     */
    protected function authorizeProduct(Request $request, Product $product)
    {
        $cid = $request->user()->company_id ?? null;
        abort_unless($cid && $product->company_id == $cid, 403, 'Forbidden');
    }
}
