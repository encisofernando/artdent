<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductsController extends Controller
{
    /**
     * Listar productos con stock total
     */
    public function index(Request $request)
    {
        $cid = $request->user()->company_id;
        
        $query = Product::where('company_id', $cid);

        // Búsqueda
        if ($search = $request->get('q')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Filtro por categoría
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        // Filtro por estado activo
        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min(max((int)($request->get('per_page') ?? 25), 1), 100);
        $products = $query->orderBy('id', 'desc')->paginate($perPage);

        // Agregar stock total e imagen principal a cada producto
        $productIds = $products->pluck('id')->toArray();
        
        // Obtener stock total por producto
        $stockTotals = Stock::whereIn('product_id', $productIds)
            ->where('company_id', $cid)
            ->groupBy('product_id')
            ->selectRaw('product_id, SUM(qty) as total_stock')
            ->pluck('total_stock', 'product_id')
            ->toArray();

        // Obtener imágenes principales
        $primaryImages = ProductImage::whereIn('product_id', $productIds)
            ->where('is_primary', 1)
            ->get()
            ->keyBy('product_id');

        // Transformar productos para incluir datos adicionales
        $products->getCollection()->transform(function ($product) use ($stockTotals, $primaryImages) {
            // Agregar stock total
            $product->stock = $stockTotals[$product->id] ?? 0;
            
            // Agregar URL de imagen principal
            if (isset($primaryImages[$product->id])) {
                $product->primary_image_url = $primaryImages[$product->id]->url;
            } else {
                $product->primary_image_url = null;
            }
            
            return $product;
        });

        return $products;
    }

    /**
     * Crear producto con stock inicial
     */
    public function store(Request $request)
    {
        $cid = $request->user()->company_id;

        $data = $request->validate([
            'name' => 'required|string|max:191',
            'sku' => 'nullable|string|max:64',
            'barcode' => 'nullable|string|max:64',
            'description' => 'nullable|string',
            'unit' => 'nullable|string|max:32',
            'category_id' => 'nullable|integer',
            'vendor_id' => 'nullable|integer',
            'cost' => 'nullable|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'tax_id' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock' => 'nullable|numeric|min:0',
            'initial_stock' => 'nullable|numeric|min:0',
        ]);

        $data['company_id'] = $cid;
        $data['cost'] = $data['cost'] ?? 0;
        $data['tax_rate'] = $data['tax_rate'] ?? 0;
        $data['is_active'] = $data['is_active'] ?? true;
        $data['track_stock'] = $data['track_stock'] ?? true;
        $data['min_stock'] = $data['min_stock'] ?? 0;

        DB::beginTransaction();
        try {
            // Extraer stock inicial
            $initialStock = $data['initial_stock'] ?? 0;
            unset($data['initial_stock']);

            // Crear producto
            $product = Product::create($data);

            // Si hay stock inicial y se controla stock
            if ($initialStock > 0 && ($data['track_stock'] ?? true)) {
                // Obtener almacén activo (primer almacén de la empresa)
                $warehouse = Warehouse::where('company_id', $cid)
                    ->where('is_active', true)
                    ->orderBy('id', 'asc')
                    ->first();

                if (!$warehouse) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'No hay almacenes activos disponibles para registrar el stock inicial'
                    ], 422);
                }

                // Crear registro de stock
                Stock::create([
                    'company_id' => $cid,
                    'warehouse_id' => $warehouse->id,
                    'product_id' => $product->id,
                    'qty' => $initialStock,
                ]);

                // Registrar movimiento de stock
                StockMovement::create([
                    'company_id' => $cid,
                    'warehouse_id' => $warehouse->id,
                    'product_id' => $product->id,
                    'movement_date' => now(),
                    'type' => 'in',
                    'qty' => $initialStock,
                    'reference_type' => 'initial_stock',
                    'reference_id' => null,
                    'note' => 'Stock inicial al crear producto',
                ]);
            }

            DB::commit();

            // Cargar stock para la respuesta
            $product->stock = $initialStock;
            $product->primary_image_url = null;

            return response()->json($product, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Mostrar un producto con su stock e imágenes
     */
    public function show(Request $request, Product $product)
    {
        $this->authorizeProduct($request, $product);

        // Cargar stock total
        $product->stock = Stock::where('product_id', $product->id)
            ->where('company_id', $product->company_id)
            ->sum('qty');

        // Cargar imágenes
        $product->load('images', 'primaryImage');

        // Agregar URL de imagen principal
        if ($product->primaryImage) {
            $product->primary_image_url = $product->primaryImage->url;
        } else if ($product->images->isNotEmpty()) {
            $product->primary_image_url = $product->images->first()->url;
        } else {
            $product->primary_image_url = null;
        }

        return $product;
    }

    /**
     * Actualizar producto con ajuste de stock
     */
    public function update(Request $request, Product $product)
    {
        $this->authorizeProduct($request, $product);

        $data = $request->validate([
            'name' => 'sometimes|string|max:191',
            'sku' => 'sometimes|nullable|string|max:64',
            'barcode' => 'sometimes|nullable|string|max:64',
            'description' => 'sometimes|nullable|string',
            'unit' => 'sometimes|nullable|string|max:32',
            'category_id' => 'sometimes|nullable|integer',
            'vendor_id' => 'sometimes|nullable|integer',
            'cost' => 'sometimes|nullable|numeric|min:0',
            'price' => 'sometimes|numeric|min:0',
            'tax_rate' => 'sometimes|nullable|numeric|min:0',
            'tax_id' => 'sometimes|nullable|integer',
            'is_active' => 'sometimes|boolean',
            'track_stock' => 'sometimes|boolean',
            'min_stock' => 'sometimes|numeric|min:0',
            'stock_adjustment' => 'sometimes|numeric',
        ]);

        DB::beginTransaction();
        try {
            // Extraer ajuste de stock
            $stockAdjustment = $data['stock_adjustment'] ?? null;
            unset($data['stock_adjustment']);

            // Actualizar producto
            $product->update($data);

            // Procesar ajuste de stock si existe
            if ($stockAdjustment !== null && $stockAdjustment != 0) {
                // Obtener almacén activo
                $warehouse = Warehouse::where('company_id', $product->company_id)
                    ->where('is_active', true)
                    ->orderBy('id', 'asc')
                    ->first();

                if (!$warehouse) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'No hay almacenes activos disponibles para ajustar el stock'
                    ], 422);
                }

                // Buscar o crear registro de stock
                $stock = Stock::firstOrCreate(
                    [
                        'company_id' => $product->company_id,
                        'warehouse_id' => $warehouse->id,
                        'product_id' => $product->id,
                    ],
                    ['qty' => 0]
                );

                // Calcular nuevo stock
                $newQty = $stock->qty + $stockAdjustment;

                // Validar que no quede negativo
                if ($newQty < 0) {
                    DB::rollBack();
                    return response()->json([
                        'message' => sprintf(
                            'El ajuste de stock (%.2f) resultaría en stock negativo. Stock actual: %.2f',
                            $stockAdjustment,
                            $stock->qty
                        )
                    ], 422);
                }

                // Actualizar cantidad
                $stock->update(['qty' => $newQty]);

                // Registrar movimiento
                StockMovement::create([
                    'company_id' => $product->company_id,
                    'warehouse_id' => $warehouse->id,
                    'product_id' => $product->id,
                    'movement_date' => now(),
                    'type' => $stockAdjustment > 0 ? 'in' : 'out',
                    'qty' => abs($stockAdjustment),
                    'reference_type' => 'adjustment',
                    'reference_id' => null,
                    'note' => sprintf(
                        'Ajuste manual: %s%.2f (Usuario: %s)',
                        $stockAdjustment > 0 ? '+' : '',
                        $stockAdjustment,
                        $request->user()->name ?? $request->user()->email
                    ),
                ]);
            }

            DB::commit();

            // Cargar stock actual para la respuesta
            $product->stock = Stock::where('product_id', $product->id)
                ->where('company_id', $product->company_id)
                ->sum('qty');

            return response()->json($product);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Eliminar producto (soft delete)
     */
    public function destroy(Request $request, Product $product)
    {
        $this->authorizeProduct($request, $product);
        $product->delete();
        return response()->noContent();
    }

    /**
     * Verificar autorización del producto
     */
    protected function authorizeProduct(Request $request, Product $product)
    {
        $cid = $request->user()->company_id;
        abort_unless($product->company_id == $cid, 403, 'Forbidden');
    }

    // ==================== IMÁGENES ====================

    /**
     * Listar imágenes de un producto
     */
    public function listImages(Request $request, Product $product)
    {
        $this->authorizeProduct($request, $product);
        
        $images = ProductImage::where('product_id', $product->id)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json($images);
    }

    /**
     * Subir imagen de producto
     */
    public function uploadImage(Request $request, Product $product)
    {
        $this->authorizeProduct($request, $product);

        $request->validate([
            'image' => 'required|image|max:5120', // 5MB
            'alt' => 'nullable|string|max:191',
            'is_primary' => 'nullable|boolean',
            'sort_order' => 'nullable|integer|min:0',
        ]);

        DB::beginTransaction();
        try {
            $file = $request->file('image');
            
            // Generar nombre único
            $filename = uniqid('prod_') . '.' . $file->getClientOriginalExtension();
            $path = "products/{$product->id}/{$filename}";
            
            // Guardar en storage/app/public/products/{product_id}
            Storage::disk('public')->put($path, file_get_contents($file));

            $isPrimary = filter_var($request->get('is_primary', false), FILTER_VALIDATE_BOOLEAN);

            // Si se marca como principal, quitar el flag de las demás
            if ($isPrimary) {
                ProductImage::where('product_id', $product->id)
                    ->update(['is_primary' => false]);
            }

            // Crear registro de imagen
            $image = ProductImage::create([
                'company_id' => $product->company_id,
                'product_id' => $product->id,
                'path' => $path,
                'alt' => $request->get('alt', $product->name),
                'sort_order' => $request->get('sort_order', 0),
                'is_primary' => $isPrimary,
            ]);

            DB::commit();

            return response()->json($image, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Marcar imagen como principal
     */
    public function setImagePrimary(Request $request, Product $product, ProductImage $image)
    {
        $this->authorizeProduct($request, $product);
        
        abort_unless($image->product_id == $product->id, 404, 'Image not found for this product');

        DB::beginTransaction();
        try {
            // Quitar flag de todas las imágenes del producto
            ProductImage::where('product_id', $product->id)
                ->update(['is_primary' => false]);

            // Marcar esta como principal
            $image->update(['is_primary' => true]);

            DB::commit();

            return response()->json($image);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Eliminar imagen
     */
    public function deleteImage(Request $request, Product $product, ProductImage $image)
    {
        $this->authorizeProduct($request, $product);
        
        abort_unless($image->product_id == $product->id, 404, 'Image not found for this product');

        DB::beginTransaction();
        try {
            // Eliminar archivo físico
            if (Storage::disk('public')->exists($image->path)) {
                Storage::disk('public')->delete($image->path);
            }

            // Eliminar registro
            $image->delete();

            // Si era la imagen principal, marcar otra como principal
            if ($image->is_primary) {
                $nextImage = ProductImage::where('product_id', $product->id)
                    ->orderBy('sort_order', 'asc')
                    ->orderBy('id', 'asc')
                    ->first();

                if ($nextImage) {
                    $nextImage->update(['is_primary' => true]);
                }
            }

            DB::commit();

            return response()->noContent();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
