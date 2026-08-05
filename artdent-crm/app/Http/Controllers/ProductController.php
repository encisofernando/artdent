<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Company;
use App\Models\Product;
use App\Models\Vendor;
use App\Services\ImageResizeService;
use App\Support\Auditor;
use App\Support\CompanyContext;
use App\Support\PlanLimitService;
use App\Support\TenantStorageUrl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
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
                    ->orWhere('barcode', 'like', "%{$search}%")
                    ->orWhereHas('product_variants', fn ($qv) => $qv
                        ->where('is_active', 1)
                        ->where(fn ($inner) => $inner
                            ->where('sku', 'like', "%{$search}%")
                            ->orWhere('barcode', 'like', "%{$search}%")
                        )
                    )
                    ->orWhereHas('barcodes', fn ($qb) => $qb->where('barcode', 'like', "%{$search}%"));
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

                if ($p->has_variants) {
                    $variantsQuery = $p->product_variants()
                        ->where('is_active', 1)
                        ->with('variant_attribute_values.product_attribute_value.product_attribute');

                    // Si hay búsqueda, priorizar variantes que coincidan (pero cargar todas)
                    $p->variants_list = $variantsQuery->get()->map(function ($v) {
                        $label = $v->variant_attribute_values
                            ->map(fn ($vav) => $vav->product_attribute_value?->value)
                            ->filter()
                            ->join(' / ');

                        return [
                            'id' => $v->id,
                            'sku' => $v->sku,
                            'barcode' => $v->barcode,
                            'label' => $label ?: $v->sku,
                        ];
                    })->values();
                }

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
     * Barcode / shelf-label printing page.
     */
    public function barcodeLabels(): \Inertia\Response
    {
        $company = \App\Models\Company::where('id', auth()->user()->company_id)
            ->first(['id', 'name', 'fantasy_name', 'logo_url', 'lab_logo_url']);

        return Inertia::render('Product/BarcodeLabels', [
            'company' => $company,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): \Inertia\Response
    {
        $categories = $this->categoriesTree();
        $vendors = $this->vendorsList();
        $usdExchangeRate = Company::find(auth()->user()->company_id)?->usd_exchange_rate;

        return Inertia::render('Product/Create', compact('categories', 'vendors', 'usdExchangeRate'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, PlanLimitService $limits)
    {
        $limits->assertCanAddProduct();

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
            'cost_currency' => 'nullable|in:ARS,USD',
            'cost_price_usd' => 'nullable|numeric',
            'price' => 'required|numeric',
            'compare_price' => 'nullable|numeric',
            'has_variants' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric',
            'width_cm' => 'nullable|integer|min:0',
            'height_cm' => 'nullable|integer|min:0',
            'depth_cm' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string',
            'tax_rate' => 'nullable|numeric',
            'stock_quantity' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:102400',
            'variants' => 'nullable|json',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/webm,video/x-msvideo|max:51200',
        ], [
            'images.*.max' => 'Cada imagen no puede superar los 100 MB.',
            'images.*.image' => 'El archivo debe ser una imagen valida (jpg, png, gif, webp).',
        ]);

        if (empty($validated['company_id'])) {
            $validated['company_id'] = auth()->user()->company_id;
        }

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']).'-'.uniqid();
        }

        $validated['min_stock'] = $validated['min_stock'] ?? 0;
        $validated = $this->applyUsdCost($validated, (int) $validated['company_id']);

        $warehouseId = ! empty($validated['track_stock'])
            ? $this->resolveWarehouseId((int) $validated['company_id'])
            : null;

        $variantsData = [];
        if (! empty($validated['has_variants']) && ! empty($validated['variants'])) {
            $variantsData = $this->sanitizeVariantsPayload(
                $this->decodeVariantsPayload($validated['variants']),
                $validated['price']
            );
        }

        // Validar unicidad de códigos de barras y SKUs antes de persistir
        $allBarcodes = array_merge(
            [$validated['barcode'] ?? null],
            array_column($variantsData, 'barcode')
        );
        $this->assertBarcodesUnique($allBarcodes, null);

        $allSkus = array_merge(
            [$validated['sku'] ?? null],
            array_column($variantsData, 'sku')
        );
        $this->assertSkusUnique($allSkus, null);

        $product = DB::transaction(function () use ($request, $validated, $warehouseId, $variantsData) {
            $product = \App\Models\Product::create($validated);

            // ── Imágenes ──────────────────────────────────────────────────────────
            // El orden en que llegan los archivos es el orden que el usuario definió
            // con drag & drop en el frontend. La primera (índice 0) es la portada.
            if ($request->hasFile('images')) {
                $resizer = app(ImageResizeService::class);
                foreach ($request->file('images') as $i => $file) {
                    $processed = $resizer->processUpload($file);
                    $product->product_images()->create([
                        'url' => $processed['url'],
                        'thumb_url' => $processed['thumb_url'],
                        'is_cover' => $i === 0 ? 1 : 0,
                        'sort_order' => $i,
                    ]);
                }
            }

            // ── Video ─────────────────────────────────────────────────────────────
            if ($request->hasFile('video')) {
                $videoPath = $request->file('video')->store('products/videos', 'public');
                $product->update(['video_url' => TenantStorageUrl::publicUrl($videoPath)]);
            }

            // ── Stock inicial ─────────────────────────────────────────────────────
            if ($warehouseId !== null && isset($validated['stock_quantity'])) {
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

            // ── Variantes ─────────────────────────────────────────────────────────
            foreach ($variantsData as $variantItem) {
                $variant = \App\Models\ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $variantItem['sku'] ?? null,
                    'barcode' => $variantItem['barcode'] ?? null,
                    'price' => $variantItem['price'] ?? $product->price,
                    'cost_price' => $variantItem['cost_price'] ?? null,
                    'is_active' => $variantItem['is_active'] ?? 1,
                ]);

                if (isset($variantItem['attributes']) && is_array($variantItem['attributes'])) {
                    foreach ($this->sanitizeVariantAttributes($variantItem['attributes']) as $attrName => $attrValueStr) {
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

                if ($warehouseId !== null && isset($variantItem['stock_quantity']) && $variantItem['stock_quantity'] !== '') {
                    $variantStockQty = (float) $variantItem['stock_quantity'];

                    \App\Models\Stock::create([
                        'product_id' => $product->id,
                        'variant_id' => $variant->id,
                        'warehouse_id' => $warehouseId,
                        'quantity' => $variantStockQty,
                    ]);

                    \App\Models\StockMovement::create([
                        'product_id' => $product->id,
                        'variant_id' => $variant->id,
                        'warehouse_id' => $warehouseId,
                        'user_id' => auth()->id(),
                        'type' => 'adjustment',
                        'quantity' => $variantStockQty,
                        'stock_before' => 0,
                        'stock_after' => $variantStockQty,
                        'note' => 'Stock inicial al crear variante',
                    ]);
                }
            }

            return $product;
        });

        if ($request->wantsJson()) {
            return response()->json(['product' => $product, 'success' => 'Product created successfully.']);
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
            'product_variants.variant_attribute_values.product_attribute_value.product_attribute',
            'barcodes'
        );

        return Inertia::render('Product/Edit', [
            'item' => $product,
            'categories' => $this->categoriesTree(),
            'vendors' => $this->vendorsList(),
            'usdExchangeRate' => Company::find($product->company_id)?->usd_exchange_rate,
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
            'cost_currency' => 'nullable|in:ARS,USD',
            'cost_price_usd' => 'nullable|numeric',
            'price' => 'required|numeric',
            'compare_price' => 'nullable|numeric',
            'has_variants' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'min_stock' => 'nullable|integer|min:0',
            'weight' => 'nullable|numeric',
            'width_cm' => 'nullable|integer|min:0',
            'height_cm' => 'nullable|integer|min:0',
            'depth_cm' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string',
            'tax_rate' => 'nullable|numeric',
            'stock_quantity' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:102400',
            'variants' => 'nullable|json',
            'video' => 'nullable|file|mimetypes:video/mp4,video/quicktime,video/webm,video/x-msvideo|max:51200',
            'image_sort' => 'nullable|array',
            'image_sort.*' => 'integer',
            'deleted_image_ids' => 'nullable|array',
            'deleted_image_ids.*' => 'integer',
            'cover_image_id' => 'nullable|integer',
        ], [
            'images.*.max' => 'Cada imagen no puede superar los 100 MB.',
            'images.*.image' => 'El archivo debe ser una imagen valida (jpg, png, gif, webp).',
        ]);

        $validated['min_stock'] = $validated['min_stock'] ?? 0;
        $validated = $this->applyUsdCost($validated, (int) $product->company_id);

        $warehouseId = ! empty($validated['track_stock'])
            ? $this->resolveWarehouseId((int) $product->company_id)
            : null;

        $variantsData = [];
        $attributeCache = [];
        $attrValueCache = [];

        // Validar unicidad del SKU del producto (sin variantes) antes de persistir
        if (! empty($validated['sku']) && empty($validated['has_variants'])) {
            $this->assertSkusUnique([$validated['sku']], $product->id);
        }

        if (! empty($validated['has_variants']) && ! empty($validated['variants'])) {
            $variantsData = $this->sanitizeVariantsPayload(
                $this->decodeVariantsPayload($validated['variants']),
                $validated['price']
            );

            // Validar unicidad de códigos de barras y SKUs excluyendo el producto actual
            $allBarcodes = array_merge(
                [$validated['barcode'] ?? null],
                array_column($variantsData, 'barcode')
            );
            $this->assertBarcodesUnique($allBarcodes, $product->id);

            $allSkus = array_merge(
                [$validated['sku'] ?? null],
                array_column($variantsData, 'sku')
            );
            $this->assertSkusUnique($allSkus, $product->id);

            $attrNames = [];
            $attrValuePairs = [];

            foreach ($variantsData as $variantItem) {
                foreach ($this->sanitizeVariantAttributes($variantItem['attributes'] ?? []) as $attrName => $attrValue) {
                    $attrNames[] = $attrName;
                    $attrValuePairs[] = ['name' => $attrName, 'value' => $attrValue];
                }
            }

            if ($attrNames) {
                $existingAttrs = \App\Models\ProductAttribute::whereIn('name', array_unique($attrNames))->get()->keyBy('name');
                foreach ($existingAttrs as $name => $attr) {
                    $attributeCache[$name] = $attr;
                }

                foreach (array_unique($attrNames) as $name) {
                    if (! isset($attributeCache[$name])) {
                        $attributeCache[$name] = \App\Models\ProductAttribute::firstOrCreate(['name' => $name]);
                    }
                }

                $attrIds = collect($attributeCache)->pluck('id')->all();
                $existingValues = \App\Models\ProductAttributeValue::whereIn('attribute_id', $attrIds)->get();
                foreach ($existingValues as $val) {
                    $attrValueCache["{$val->attribute_id}:{$val->value}"] = $val;
                }

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

        // Subir archivos ANTES de la transacción (puede tardar y no necesita rollback de BD)
        $uploadedImages = [];
        if ($request->hasFile('images')) {
            $resizer = app(ImageResizeService::class);
            foreach ($request->file('images') as $file) {
                $uploadedImages[] = $resizer->processUpload($file);
            }
        }

        $uploadedVideo = null;
        if ($request->hasFile('video')) {
            $uploadedVideo = $request->file('video')->store('products/videos', 'public');
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
                foreach ($uploadedImages as $i => $processed) {
                    $newImages[] = [
                        'product_id' => $product->id,
                        'url' => $processed['url'],
                        'thumb_url' => $processed['thumb_url'],
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
                $product->update(['video_url' => TenantStorageUrl::publicUrl($uploadedVideo)]);
            }

            // ── Stock base (sin variante) ──────────────────────────────────────
            if ($warehouseId !== null && $request->has('stock_quantity')) {
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
                            'barcode' => $variantItem['barcode'] ?? null,
                            'price' => $variantItem['price'] ?? $product->price,
                            'cost_price' => $variantItem['cost_price'] ?? null,
                            'is_active' => $variantItem['is_active'] ?? 1,
                        ]
                    );
                    $processedVariantIds[] = $variant->id;

                    if (isset($variantItem['attributes']) && is_array($variantItem['attributes'])) {
                        $variant->variant_attribute_values()->delete();

                        $newAttrValues = [];
                        foreach ($this->sanitizeVariantAttributes($variantItem['attributes']) as $attrName => $attrValueStr) {
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

                    if ($warehouseId !== null && isset($variantItem['stock_quantity']) && $variantItem['stock_quantity'] !== '') {
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
        $relativePath = TenantStorageUrl::relativePath($publicUrl);

        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }
    }

    /**
     * Limpia atributos de variantes para evitar claves/valores vacíos y normalizar formato.
     */
    private function sanitizeVariantAttributes(array $attributes): array
    {
        $sanitized = [];

        foreach ($attributes as $attrName => $attrValue) {
            $name = $this->normalizeVariantAttributeName($attrName);
            $value = $this->normalizeVariantAttributeValue($attrValue);

            if ($name === '' || $value === '') {
                continue;
            }

            $sanitized[$name] = $value;
        }

        return $sanitized;
    }

    /**
     * Normaliza el payload de variantes para evitar strings vacíos en columnas numéricas.
     */
    private function sanitizeVariantsPayload(array $variants, mixed $defaultPrice): array
    {
        $sanitized = [];
        $normalizedDefaultPrice = $this->normalizeNullableNumber($defaultPrice) ?? 0;

        foreach ($variants as $variantItem) {
            if (! is_array($variantItem)) {
                continue;
            }

            $normalizedPrice = $this->normalizeNullableNumber($variantItem['price'] ?? null);

            $sanitized[] = [
                'id' => $this->normalizeNullableInteger($variantItem['id'] ?? null),
                'sku' => $this->normalizeNullableString($variantItem['sku'] ?? null),
                'barcode' => $this->normalizeNullableString($variantItem['barcode'] ?? null),
                'price' => $normalizedPrice ?? $normalizedDefaultPrice,
                'cost_price' => $this->normalizeNullableNumber($variantItem['cost_price'] ?? null),
                'stock_quantity' => $this->normalizeNullableNumber($variantItem['stock_quantity'] ?? null),
                'is_active' => $this->normalizeBooleanFlag($variantItem['is_active'] ?? 1, 1),
                'attributes' => $this->sanitizeVariantAttributes($variantItem['attributes'] ?? []),
            ];
        }

        return $sanitized;
    }

    private function normalizeNullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        return $normalized === '' ? null : $normalized;
    }

    private function normalizeNullableNumber(mixed $value): int|float|null
    {
        if ($value === null) {
            return null;
        }

        $normalized = trim((string) $value);

        if ($normalized === '' || ! is_numeric($normalized)) {
            return null;
        }

        return str_contains($normalized, '.') ? (float) $normalized : (int) $normalized;
    }

    private function normalizeNullableInteger(mixed $value): ?int
    {
        $normalized = $this->normalizeNullableNumber($value);

        return $normalized === null ? null : (int) $normalized;
    }

    private function normalizeBooleanFlag(mixed $value, int $default = 1): int
    {
        if ($value === null || $value === '') {
            return $default;
        }

        if (in_array($value, [false, 0, '0', 'false', 'off'], true)) {
            return 0;
        }

        return 1;
    }

    /**
     * Decodifica el payload de variantes y falla con 422 si no es válido.
     */
    private function decodeVariantsPayload(mixed $variantsRaw): array
    {
        if (is_array($variantsRaw)) {
            return $variantsRaw;
        }

        if (is_string($variantsRaw)) {
            $decoded = json_decode($variantsRaw, true);

            if (is_array($decoded)) {
                return $decoded;
            }
        }

        throw ValidationException::withMessages([
            'variants' => 'El formato de variantes es inválido.',
        ]);
    }

    /**
     * Resuelve un depósito para stock y evita errores por FK inválida.
     */
    private function resolveWarehouseId(int $companyId): int
    {
        $warehouseId = \App\Models\Warehouse::where('company_id', $companyId)->value('id');

        if (! $warehouseId) {
            throw ValidationException::withMessages([
                'stock_quantity' => 'No hay depósitos configurados para esta empresa.',
            ]);
        }

        return (int) $warehouseId;
    }

    // ── aumento masivo de precios ──────────────────────────────────────────────

    public function bulkPriceForm(): \Inertia\Response
    {
        $categories = Category::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $vendors = $this->vendorsList();
        $usdExchangeRate = Company::find(auth()->user()->company_id)?->usd_exchange_rate;
        $usdProductsCount = Product::where('company_id', CompanyContext::id())
            ->where('cost_currency', 'USD')
            ->whereNotNull('cost_price_usd')
            ->count();

        return Inertia::render('Product/BulkPrice', [
            'categories' => $categories,
            'vendors' => $vendors,
            'usdExchangeRate' => $usdExchangeRate,
            'usdProductsCount' => $usdProductsCount,
        ]);
    }

    public function bulkPricePreview(Request $request)
    {
        $validated = $this->validateBulkPriceRequest($request);

        $products = $this->bulkPriceQuery($validated)->orderBy('name')->limit(20)->get(['id', 'name', 'sku', 'price', 'cost_price']);
        $count = $this->bulkPriceQuery($validated)->count();

        $sample = $products->map(fn (Product $product) => [
            'id' => $product->id,
            'name' => $product->name,
            'sku' => $product->sku,
            'current_price' => (float) $product->price,
            'new_price' => $validated['target'] !== 'cost_price'
                ? $this->calculateAdjustedAmount((float) $product->price, $validated)
                : (float) $product->price,
            'current_cost_price' => (float) $product->cost_price,
            'new_cost_price' => $validated['target'] !== 'price'
                ? $this->calculateAdjustedAmount((float) $product->cost_price, $validated)
                : (float) $product->cost_price,
        ]);

        return response()->json([
            'count' => $count,
            'sample' => $sample,
        ]);
    }

    public function bulkPriceApply(Request $request)
    {
        $validated = $this->validateBulkPriceRequest($request);

        $count = DB::transaction(function () use ($validated) {
            $products = $this->bulkPriceQuery($validated)->get(['id', 'price', 'cost_price']);

            foreach ($products as $product) {
                $update = [];

                if ($validated['target'] !== 'cost_price') {
                    $update['price'] = $this->calculateAdjustedAmount((float) $product->price, $validated);
                }

                if ($validated['target'] !== 'price') {
                    $update['cost_price'] = $this->calculateAdjustedAmount((float) $product->cost_price, $validated);
                }

                Product::whereKey($product->id)->update($update);
            }

            return $products->count();
        });

        Auditor::log('product.bulk_price_applied', null, [
            'affected_count' => $count,
            'target' => $validated['target'],
            'adjustment_type' => $validated['adjustment_type'],
            'direction' => $validated['direction'],
            'value' => $validated['value'],
            'category_id' => $validated['category_id'] ?? null,
            'vendor_id' => $validated['vendor_id'] ?? null,
        ]);

        return redirect()->route('products.bulk-price')->with('success', "Se actualizó el precio de {$count} artículo(s).");
    }

    /** @return array{category_id: ?int, vendor_id: ?int, active_only: bool, adjustment_type: string, direction: string, value: float, target: string} */
    private function validateBulkPriceRequest(Request $request): array
    {
        return $request->validate([
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'vendor_id' => ['nullable', 'integer', 'exists:vendors,id'],
            'active_only' => ['boolean'],
            'adjustment_type' => ['required', 'in:percentage,fixed'],
            'direction' => ['required', 'in:increase,decrease'],
            'value' => ['required', 'numeric', 'min:0.01'],
            'target' => ['required', 'in:price,cost_price,both'],
        ]);
    }

    private function bulkPriceQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        return Product::query()
            ->where('company_id', CompanyContext::id())
            ->when($filters['category_id'] ?? null, fn ($q, $categoryId) => $q->where('category_id', $categoryId))
            ->when($filters['vendor_id'] ?? null, fn ($q, $vendorId) => $q->where('vendor_id', $vendorId))
            ->when($filters['active_only'] ?? false, fn ($q) => $q->where('is_active', true));
    }

    private function calculateAdjustedAmount(float $current, array $filters): float
    {
        $sign = $filters['direction'] === 'increase' ? 1 : -1;

        if ($filters['adjustment_type'] === 'percentage') {
            $new = $current + ($sign * $current * $filters['value'] / 100);
        } else {
            $new = $current + ($sign * $filters['value']);
        }

        return round(max(0, $new), 2);
    }

    /**
     * Si el costo se carga en USD, el costo en pesos (`cost_price`, usado en todos los
     * cálculos de margen/reportes) se recalcula automáticamente contra la cotización
     * vigente de la empresa. Si se carga en ARS, no se toca nada.
     */
    private function applyUsdCost(array $validated, int $companyId): array
    {
        if (($validated['cost_currency'] ?? 'ARS') !== 'USD' || empty($validated['cost_price_usd'])) {
            return $validated;
        }

        $rate = (float) (Company::find($companyId)?->usd_exchange_rate ?? 0);

        if ($rate > 0) {
            $validated['cost_price'] = round((float) $validated['cost_price_usd'] * $rate, 2);
        }

        return $validated;
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

    /**
     * Verifica que ningún código de barras se repita en products ni product_variants.
     * Lanza ValidationException si encuentra un duplicado.
     *
     * @param  array<string|null>  $barcodes  todos los barcodes del request (producto + variantes)
     * @param  int|null  $excludeProductId  ID del producto actual (para ignorarlo en la búsqueda)
     */
    private function assertBarcodesUnique(array $barcodes, ?int $excludeProductId = null): void
    {
        $barcodes = array_values(array_filter($barcodes));

        // Duplicados dentro del propio request
        if (count($barcodes) !== count(array_unique($barcodes))) {
            throw ValidationException::withMessages([
                'barcode' => 'El mismo código de barras no puede asignarse a más de una variante.',
            ]);
        }

        foreach ($barcodes as $bc) {
            // Buscar en products (excluyendo el producto actual)
            $inProducts = Product::where('barcode', $bc)
                ->when($excludeProductId, fn ($q) => $q->where('id', '!=', $excludeProductId))
                ->exists();

            // Buscar en product_variants (excluyendo variantes del producto actual)
            $inVariants = \App\Models\ProductVariant::where('barcode', $bc)
                ->when($excludeProductId, fn ($q) => $q->where('product_id', '!=', $excludeProductId))
                ->exists();

            // Buscar en códigos de barra adicionales (excluyendo los del producto actual)
            $inExtraBarcodes = \App\Models\ProductBarcode::where('barcode', $bc)
                ->when($excludeProductId, fn ($q) => $q->where('product_id', '!=', $excludeProductId))
                ->exists();

            if ($inProducts || $inVariants || $inExtraBarcodes) {
                throw ValidationException::withMessages([
                    'barcode' => "El código de barras «{$bc}» ya está asignado a otro producto o variante.",
                ]);
            }
        }
    }

    /**
     * Verifica que ningún SKU se repita en products ni product_variants.
     * Lanza ValidationException si encuentra un duplicado.
     *
     * @param  array<string|null>  $skus  todos los SKUs del request (producto + variantes)
     * @param  int|null  $excludeProductId  ID del producto actual (para ignorarlo en edición)
     */
    private function assertSkusUnique(array $skus, ?int $excludeProductId = null): void
    {
        $skus = array_values(array_filter(array_map('trim', $skus)));

        if (count($skus) === 0) {
            return;
        }

        // Duplicados dentro del propio request
        if (count($skus) !== count(array_unique($skus))) {
            throw ValidationException::withMessages([
                'sku' => 'El mismo SKU no puede asignarse a más de una variante del mismo producto.',
            ]);
        }

        foreach ($skus as $sku) {
            $inProducts = Product::where('sku', $sku)
                ->when($excludeProductId, fn ($q) => $q->where('id', '!=', $excludeProductId))
                ->exists();

            $inVariants = \App\Models\ProductVariant::where('sku', $sku)
                ->when($excludeProductId, fn ($q) => $q->where('product_id', '!=', $excludeProductId))
                ->exists();

            if ($inProducts || $inVariants) {
                throw ValidationException::withMessages([
                    'sku' => "El SKU «{$sku}» ya está en uso por otro producto o variante.",
                ]);
            }
        }
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
