<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = \App\Models\Product::with(['product_images', 'stocks']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', 1);
        } elseif ($status === 'inactive') {
            $query->where('is_active', 0);
        }

        $items = $query->paginate(20)->withQueryString();

        // Infinite scroll: axios requests llegan con Accept: application/json
        if ($request->wantsJson()) {
            $items->getCollection()->transform(function ($p) {
                $p->stock_quantity = $p->stocks->sum('quantity');

                return $p;
            });

            return response()->json(['items' => $items]);
        }

        $items->getCollection()->transform(function ($p) {
            $p->stock_quantity = $p->stocks->sum('quantity');

            return $p;
        });

        return Inertia::render('Product/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        $categories = $this->categoriesTree();
        $vendors = $this->vendorsList();

        return Inertia::render('Product/Create', compact('categories', 'vendors'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'vendor_id' => 'nullable|integer',
            'category_id' => 'nullable',
            'tax_id' => 'nullable',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'cost_price' => 'nullable|numeric',
            'price' => 'required|numeric',
            'compare_price' => 'nullable|numeric',
            'has_variants' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string',
            'tax_rate' => 'nullable|numeric',
            'stock_quantity' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:2048',
            'variants' => 'nullable|json',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/webm,video/x-msvideo|max:51200',
        ]);

        if (empty($validated['company_id'])) {
            $validated['company_id'] = auth()->user()->company_id;
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.uniqid();
        }

        $validated['min_stock'] = $validated['min_stock'] ?? 0;

        $product = \App\Models\Product::create($validated);

        // ── Imágenes ──────────────────────────────────────────────────────────
        // El orden en que llegan los archivos es el orden que el usuario definió
        // con drag & drop en el frontend. La primera (índice 0) es la portada.
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('products', 'public');
                $product->product_images()->create([
                    'url' => '/storage/'.$path,
                    'is_cover' => $i === 0 ? 1 : 0,
                    'sort_order' => $i,
                ]);
            }
        }

        // ── Video ─────────────────────────────────────────────────────────────
        if ($request->hasFile('video')) {
            $videoPath = $request->file('video')->store('products/videos', 'public');
            $product->update(['video_url' => '/storage/'.$videoPath]);
        }

        // ── Stock inicial ─────────────────────────────────────────────────────
        if (! empty($validated['track_stock']) && isset($validated['stock_quantity'])) {
            $warehouseId = \App\Models\Warehouse::where('company_id', $validated['company_id'])->value('id') ?? 1;

            \App\Models\Stock::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouseId,
                'quantity' => $validated['stock_quantity'],
            ]);

            \App\Models\StockMovement::create([
                'product_id' => $product->id,
                'warehouse_id' => $warehouseId,
                'user_id' => auth()->id(),
                'type' => 'adjustment',
                'quantity' => $validated['stock_quantity'],
                'stock_before' => 0,
                'stock_after' => $validated['stock_quantity'],
                'note' => 'Stock inicial al crear el producto',
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json(['product' => $product, 'success' => 'Product created successfully.']);
        }

        // ── Variantes ─────────────────────────────────────────────────────────
        if (! empty($validated['has_variants']) && ! empty($validated['variants'])) {
            $variantsData = json_decode($validated['variants'], true);
            if (is_array($variantsData)) {
                foreach ($variantsData as $variantItem) {
                    $variant = \App\Models\ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $variantItem['sku'] ?? null,
                        'price' => $variantItem['price'] ?? $product->price,
                        'cost_price' => $variantItem['cost_price'] ?? null,
                        'is_active' => $variantItem['is_active'] ?? 1,
                    ]);

                    if (isset($variantItem['attributes']) && is_array($variantItem['attributes'])) {
                        foreach ($variantItem['attributes'] as $attrName => $attrValueStr) {
                            $attribute = \App\Models\ProductAttribute::firstOrCreate(['name' => $attrName]);
                            $attrValue = \App\Models\ProductAttributeValue::firstOrCreate([
                                'attribute_id' => $attribute->id,
                                'value' => $attrValueStr,
                            ]);
                            \App\Models\VariantAttributeValue::create([
                                'variant_id' => $variant->id,
                                'attribute_value_id' => $attrValue->id,
                            ]);
                        }
                    }

                    if (! empty($validated['track_stock']) && isset($variantItem['stock_quantity']) && $variantItem['stock_quantity'] !== '') {
                        $variantWarehouseId = \App\Models\Warehouse::where('company_id', $validated['company_id'])->value('id') ?? 1;
                        $variantStockQty = (float) $variantItem['stock_quantity'];

                        \App\Models\Stock::create([
                            'product_id' => $product->id,
                            'variant_id' => $variant->id,
                            'warehouse_id' => $variantWarehouseId,
                            'quantity' => $variantStockQty,
                        ]);

                        \App\Models\StockMovement::create([
                            'product_id' => $product->id,
                            'variant_id' => $variant->id,
                            'warehouse_id' => $variantWarehouseId,
                            'user_id' => auth()->id(),
                            'type' => 'adjustment',
                            'quantity' => $variantStockQty,
                            'stock_before' => 0,
                            'stock_after' => $variantStockQty,
                            'note' => 'Stock inicial al crear variante',
                        ]);
                    }
                }
            }
        }

        $lowStockWarning = $this->checkLowStock($product, $validated['stock_quantity'] ?? null);

        return redirect()->route('products.index')
            ->with('success', 'Producto creado correctamente.')
            ->with('warning', $lowStockWarning);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $product->load(
            'product_images',
            'stocks',
            'product_variants.stocks',
            'product_variants.variant_attribute_values.product_attribute_value.product_attribute'
        );

        return Inertia::render('Product/Edit', [
            'item' => $product,
            'categories' => $this->categoriesTree(),
            'vendors' => $this->vendorsList(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'vendor_id' => 'nullable|integer',
            'category_id' => 'nullable',
            'tax_id' => 'nullable',
            'name' => 'required|string|max:255',
            'brand' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'cost_price' => 'nullable|numeric',
            'price' => 'required|numeric',
            'compare_price' => 'nullable|numeric',
            'has_variants' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string',
            'tax_rate' => 'nullable|numeric',
            'stock_quantity' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:2048',
            'variants' => 'nullable|json',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/webm,video/x-msvideo|max:51200',
            'image_sort' => 'nullable|array',
            'image_sort.*' => 'integer',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'integer',
            'cover_image_id' => 'nullable|integer',
        ]);

        // Subir archivos ANTES de la transacción (puede tardar y no necesita rollback de BD)
        $uploadedImages = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $uploadedImages[] = $file->store('products', 'public');
            }
        }

        $uploadedVideo = null;
        if ($request->hasFile('video')) {
            $uploadedVideo = $request->file('video')->store('products/videos', 'public');
        }

        // Resolver warehouse ID una sola vez, fuera de cualquier loop
        $warehouseId = \App\Models\Warehouse::where('company_id', $product->company_id)->value('id') ?? 1;

        // Pre-cargar atributos existentes para evitar N queries firstOrCreate dentro del loop
        $variantsData = [];
        $attributeCache = [];   // 'name' => ProductAttribute
        $attrValueCache = [];   // 'attributeId:value' => ProductAttributeValue

        if (! empty($validated['has_variants']) && ! empty($validated['variants'])) {
            $variantsData = json_decode($validated['variants'], true) ?? [];

            // Recolectar todos los nombres de atributo y valores únicos
            $attrNames = [];
            $attrValuePairs = [];
            foreach ($variantsData as $variantItem) {
                foreach ($variantItem['attributes'] ?? [] as $attrName => $attrValue) {
                    $attrNames[] = $attrName;
                    $attrValuePairs[] = ['name' => $attrName, 'value' => $attrValue];
                }
            }

            // Cargar atributos existentes en una sola query
            if ($attrNames) {
                $existingAttrs = \App\Models\ProductAttribute::whereIn('name', array_unique($attrNames))->get()->keyBy('name');
                foreach ($existingAttrs as $name => $attr) {
                    $attributeCache[$name] = $attr;
                }

                // Crear los que faltan de a uno (raro en práctica)
                foreach (array_unique($attrNames) as $name) {
                    if (! isset($attributeCache[$name])) {
                        $attributeCache[$name] = \App\Models\ProductAttribute::firstOrCreate(['name' => $name]);
                    }
                }

                // Cargar valores de atributo existentes en una sola query por attribute_id
                $attrIds = collect($attributeCache)->pluck('id')->all();
                $existingValues = \App\Models\ProductAttributeValue::whereIn('attribute_id', $attrIds)->get();
                foreach ($existingValues as $val) {
                    $attrValueCache["{$val->attribute_id}:{$val->value}"] = $val;
                }

                // Crear los valores que faltan
                foreach ($attrValuePairs as $pair) {
                    $attr = $attributeCache[$pair['name']];
                    $cacheKey = "{$attr->id}:{$pair['value']}";
                    if (! isset($attrValueCache[$cacheKey])) {
                        $attrValueCache[$cacheKey] = \App\Models\ProductAttributeValue::firstOrCreate([
                            'attribute_id' => $attr->id,
                            'value' => $pair['value'],
                        ]);
                    }
                }
            }
        }

        $userId = auth()->id();

        DB::transaction(function () use (
            $product, $validated, $request, $warehouseId, $userId,
            $uploadedImages, $uploadedVideo, $variantsData,
            $attributeCache, $attrValueCache
        ): void {
            $product->update($validated);

            // ── Eliminar imágenes marcadas como borradas ───────────────────────
            if (! empty($validated['deleted_image_ids'])) {
                $toDelete = $product->product_images()
                    ->whereIn('id', $validated['deleted_image_ids'])
                    ->get();

                foreach ($toDelete as $img) {
                    $this->deleteImageFile($img->url);
                    $img->delete();
                }
            }

            // ── Reordenar imágenes: un solo UPDATE con CASE WHEN ──────────────
            if (! empty($validated['image_sort'])) {
                $imageIds = $validated['image_sort'];
                $sortCases = '';
                $coverCases = '';
                $coverId = $imageIds[0];

                foreach ($imageIds as $order => $imageId) {
                    $sortCases .= "WHEN {$imageId} THEN {$order} ";
                    $coverCases .= "WHEN {$imageId} THEN ".($order === 0 ? '1' : '0').' ';
                }

                $placeholders = implode(',', $imageIds);
                DB::statement("UPDATE product_images
                    SET sort_order = CASE id {$sortCases} END,
                        is_cover   = CASE id {$coverCases} END
                    WHERE id IN ({$placeholders})");
            } elseif (! empty($validated['cover_image_id'])) {
                $product->product_images()->update(['is_cover' => 0]);
                $product->product_images()
                    ->where('id', $validated['cover_image_id'])
                    ->update(['is_cover' => 1]);
            }

            // ── Agregar nuevas imágenes ───────────────────────────────────────
            if ($uploadedImages) {
                $maxSortOrder = $product->product_images()->max('sort_order') ?? -1;
                $hasCover = $product->product_images()->where('is_cover', 1)->exists();

                $newImages = [];
                foreach ($uploadedImages as $i => $path) {
                    $newImages[] = [
                        'product_id' => $product->id,
                        'url' => '/storage/'.$path,
                        'is_cover' => (! $hasCover && $i === 0) ? 1 : 0,
                        'sort_order' => $maxSortOrder + 1 + $i,
                    ];
                }
                \App\Models\ProductImage::insert($newImages);
            }

            // ── Video ─────────────────────────────────────────────────────────
            if ($uploadedVideo) {
                if ($product->video_url) {
                    $this->deleteStorageFile($product->video_url);
                }
                $product->update(['video_url' => '/storage/'.$uploadedVideo]);
            }

            // ── Stock base (sin variante) ──────────────────────────────────────
            if (! empty($validated['track_stock']) && $request->has('stock_quantity')) {
                $stock = \App\Models\Stock::firstOrCreate(
                    ['product_id' => $product->id, 'warehouse_id' => $warehouseId, 'variant_id' => null],
                    ['quantity' => 0]
                );

                $qtyDiff = $validated['stock_quantity'] - $stock->quantity;
                if ($qtyDiff != 0) {
                    $stockBefore = $stock->quantity;
                    $stock->update(['quantity' => $validated['stock_quantity']]);

                    \App\Models\StockMovement::create([
                        'product_id' => $product->id,
                        'warehouse_id' => $warehouseId,
                        'user_id' => $userId,
                        'type' => 'adjustment',
                        'quantity' => $qtyDiff,
                        'stock_before' => $stockBefore,
                        'stock_after' => $validated['stock_quantity'],
                        'note' => 'Ajuste manual desde edición de producto',
                    ]);

                    \App\Services\StockAlertService::checkAndNotify($product->id, null, $warehouseId);
                }
            }

            // ── Variantes ─────────────────────────────────────────────────────
            if (! empty($validated['has_variants']) && $variantsData) {
                $processedVariantIds = [];

                foreach ($variantsData as $variantItem) {
                    $variant = \App\Models\ProductVariant::updateOrCreate(
                        ['product_id' => $product->id, 'id' => $variantItem['id'] ?? null],
                        [
                            'sku' => $variantItem['sku'] ?? null,
                            'price' => $variantItem['price'] ?? $product->price,
                            'cost_price' => $variantItem['cost_price'] ?? null,
                            'is_active' => $variantItem['is_active'] ?? 1,
                        ]
                    );
                    $processedVariantIds[] = $variant->id;

                    if (isset($variantItem['attributes']) && is_array($variantItem['attributes'])) {
                        $variant->variant_attribute_values()->delete();

                        $newAttrValues = [];
                        foreach ($variantItem['attributes'] as $attrName => $attrValueStr) {
                            $attr = $attributeCache[$attrName];
                            $attrValue = $attrValueCache["{$attr->id}:{$attrValueStr}"];
                            $newAttrValues[] = [
                                'variant_id' => $variant->id,
                                'attribute_value_id' => $attrValue->id,
                            ];
                        }
                        if ($newAttrValues) {
                            \App\Models\VariantAttributeValue::insert($newAttrValues);
                        }
                    }

                    if (! empty($validated['track_stock']) && isset($variantItem['stock_quantity']) && $variantItem['stock_quantity'] !== '') {
                        $newVariantQty = (float) $variantItem['stock_quantity'];

                        $variantStock = \App\Models\Stock::firstOrCreate(
                            ['product_id' => $product->id, 'variant_id' => $variant->id, 'warehouse_id' => $warehouseId],
                            ['quantity' => 0]
                        );

                        $variantQtyDiff = $newVariantQty - (float) $variantStock->quantity;
                        if ($variantQtyDiff != 0) {
                            $variantStockBefore = $variantStock->quantity;
                            $variantStock->update(['quantity' => $newVariantQty]);

                            \App\Models\StockMovement::create([
                                'product_id' => $product->id,
                                'variant_id' => $variant->id,
                                'warehouse_id' => $warehouseId,
                                'user_id' => $userId,
                                'type' => 'adjustment',
                                'quantity' => $variantQtyDiff,
                                'stock_before' => $variantStockBefore,
                                'stock_after' => $newVariantQty,
                                'note' => 'Ajuste manual desde edición de variante',
                            ]);
                        }
                    }
                }

                \App\Models\ProductVariant::where('product_id', $product->id)
                    ->whereNotIn('id', $processedVariantIds)
                    ->delete();
            } else {
                \App\Models\ProductVariant::where('product_id', $product->id)->delete();
            }
        });

        $product->refresh()->load('stocks');
        $currentStock = $product->stocks->sum('quantity');
        $lowStockWarning = $this->checkLowStock($product, $currentStock);

        return redirect()->route('products.index')
            ->with('success', 'Producto actualizado correctamente.')
            ->with('warning', $lowStockWarning);
    }

    /**
     * Remove the specified resource from storage.
     * Elimina archivos físicos (imágenes + video) antes de borrar el registro.
     */
    public function destroy(Product $product)
    {
        // Borrar archivos de imágenes
        foreach ($product->product_images as $img) {
            $this->deleteImageFile($img->url);
        }

        // Borrar video si existe
        if ($product->video_url) {
            $this->deleteStorageFile($product->video_url);
        }

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    // ── helpers privados ──────────────────────────────────────────────────────

    /**
     * Elimina un archivo de imagen del storage público.
     * Acepta la URL pública (/storage/products/xxx.jpg) y la convierte
     * a la ruta relativa de disco (products/xxx.jpg).
     */
    private function deleteImageFile(string $publicUrl): void
    {
        $this->deleteStorageFile($publicUrl);
    }

    /**
     * Convierte una URL pública tipo "/storage/products/videos/foo.mp4"
     * en la ruta de disco "products/videos/foo.mp4" y la elimina.
     */
    private function deleteStorageFile(string $publicUrl): void
    {
        // '/storage/xxx' → 'xxx'
        $relativePath = ltrim(str_replace('/storage/', '', $publicUrl), '/');

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }

    // ── import / export (sin cambios) ─────────────────────────────────────────

    /**
     * Import products from CSV mapped data
     */
    public function importCsv(Request $request)
    {
        $request->validate([
            'products' => 'required|array',
            'products.*.name' => 'required|string',
            'products.*.price' => 'required|numeric',
        ]);

        $imported = 0;

        foreach ($request->products as $item) {
            Product::updateOrCreate(
                ['name' => $item['name']],
                [
                    'sku' => $item['sku'] ?? null,
                    'cost_price' => isset($item['cost_price']) ? floatval(str_replace(',', '.', $item['cost_price'])) : 0,
                    'price' => isset($item['price']) ? floatval(str_replace(',', '.', $item['price'])) : 0,
                    'has_variants' => false,
                    'is_active' => true,
                ]
            );
            $imported++;
        }

        return response()->json(['imported' => $imported]);
    }

    /**
     * Import products from raw SQL Script
     */
    public function importSql(Request $request)
    {
        $request->validate([
            'sql_file' => 'required|file|mimetypes:text/plain,application/sql',
        ]);

        try {
            $sql = file_get_contents($request->file('sql_file')->getRealPath());
            \DB::unprepared($sql);

            return response()->json(['message' => 'Script SQL ejecutado con éxito.']);
        } catch (\Exception $e) {
            \Log::error('SQL Import Error: '.$e->getMessage());

            return response()->json(['error' => 'Error ejecutando el script. Revisa el log de Laravel.'], 500);
        }
    }

    private function categoriesTree(): \Illuminate\Database\Eloquent\Collection
    {
        return Category::query()
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->with(['categories' => fn ($q) => $q->where('is_active', true)->orderBy('name')])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function vendorsList(): \Illuminate\Database\Eloquent\Collection
    {
        return Vendor::query()
            ->where('company_id', auth()->user()->company_id)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private function checkLowStock(Product $product, int|float|null $currentStock): ?string
    {
        if (! $product->track_stock || $product->min_stock <= 0 || $currentStock === null) {
            return null;
        }

        if ($currentStock <= $product->min_stock) {
            return "⚠️ Stock bajo en \"{$product->name}\": {$currentStock} unidades (mínimo: {$product->min_stock}).";
        }

        return null;
    }
}
