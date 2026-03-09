<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        // Inertia no intercepta estas requests, así que devolvemos JSON directo.
        if ($request->wantsJson()) {
            // Mapear stock_quantity antes de responder
            $items->getCollection()->transform(function ($p) {
                $p->stock_quantity = $p->stocks->sum('quantity');
                return $p;
            });
            return response()->json(['items' => $items]);
        }

        // Para Inertia SSR también mapeamos
        $items->getCollection()->transform(function ($p) {
            $p->stock_quantity = $p->stocks->sum('quantity');
            return $p;
        });

        return Inertia::render('Product/Index', [
            'items'   => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Product/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'vendor_id' => 'nullable',
            'category_id' => 'nullable',
            'tax_id' => 'nullable',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'cost_price' => 'nullable|numeric',
            'price' => 'required|numeric',
            'compare_price' => 'nullable|numeric',
            'has_variants' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'weight' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string',
            'tax_rate' => 'nullable|numeric',
            'stock_quantity' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:2048', // Validate uploaded images (max 2MB each)
            'variants' => 'nullable|json' // Variants data array encoded as JSON
        ]);

        if (empty($validated['company_id'])) {
            $validated['company_id'] = auth()->user()->company_id;
        }
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']) . '-' . uniqid();
        }

        $product = \App\Models\Product::create($validated);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('products', 'public');
                $product->product_images()->create([
                    'url' => '/storage/' . $path,
                    'is_cover' => $i === 0 ? 1 : 0, 
                    'sort_order' => $i
                ]);
            }
        }

        if (!empty($validated['track_stock']) && isset($validated['stock_quantity'])) {
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
                'note' => 'Stock inicial al crear el producto'
            ]);
        }

        if ($request->wantsJson()) {
            return response()->json(['product' => $product, 'success' => 'Product created successfully.']);
        }

        // --- VARIANTS PROCESSING ---
        if (!empty($validated['has_variants']) && !empty($validated['variants'])) {
            $variantsData = json_decode($validated['variants'], true);
            if (is_array($variantsData)) {
                foreach ($variantsData as $variantItem) {
                    // 1. Create the variant
                    $variant = \App\Models\ProductVariant::create([
                        'product_id' => $product->id,
                        'sku' => $variantItem['sku'] ?? null,
                        'price' => $variantItem['price'] ?? $product->price,
                        'cost_price' => $variantItem['cost_price'] ?? null,
                        'is_active' => $variantItem['is_active'] ?? 1,
                    ]);

                    // 2. Process attributes "Color: Red", "Size: L"
                    if (isset($variantItem['attributes']) && is_array($variantItem['attributes'])) {
                        foreach ($variantItem['attributes'] as $attrName => $attrValueStr) {
                            // Find or Create Attribute Name
                            $attribute = \App\Models\ProductAttribute::firstOrCreate(
                                ['name' => $attrName]
                            );

                            // Find or Create Attribute Value
                            $attrValue = \App\Models\ProductAttributeValue::firstOrCreate([
                                'attribute_id' => $attribute->id,
                                'value' => $attrValueStr
                            ]);

                            // Link Variant + Value
                            \App\Models\VariantAttributeValue::create([
                                'variant_id' => $variant->id,
                                'attribute_value_id' => $attrValue->id
                            ]);
                        }
                    }
                }
            }
        }
        // ---------------------------

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $product->load(
            'product_images', 
            'stocks',
            'product_variants.variant_attribute_values.product_attribute_value.product_attribute'
        ); // Eager load variants & relationships
        
        return Inertia::render('Product/Edit', [
            'item' => $product
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'company_id' => 'nullable',
            'vendor_id' => 'nullable',
            'category_id' => 'nullable',
            'tax_id' => 'nullable',
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'sku' => 'nullable|string|max:100',
            'barcode' => 'nullable|string|max:100',
            'short_description' => 'nullable|string',
            'description' => 'nullable|string',
            'cost_price' => 'nullable|numeric',
            'price' => 'required|numeric',
            'compare_price' => 'nullable|numeric',
            'has_variants' => 'nullable|boolean',
            'track_stock' => 'nullable|boolean',
            'weight' => 'nullable|numeric',
            'is_active' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_desc' => 'nullable|string',
            'tax_rate' => 'nullable|numeric',
            'stock_quantity' => 'nullable|numeric',
            'images.*' => 'nullable|image|max:2048', // Prevent non-images or large files
            'variants' => 'nullable|json' 
        ]);

        $product->update($validated);

        // Upload and attach new images
        if ($request->hasFile('images')) {
            // Determine the next sort order
            $maxSortOrder = $product->product_images()->max('sort_order') ?? -1;
            
            // If the product previously had no cover, we'll mark the first uploaded image as cover
            $hasCover = $product->product_images()->where('is_cover', 1)->exists();

            foreach ($request->file('images') as $i => $file) {
                $path = $file->store('products', 'public');
                $isCoverForThisIteration = !$hasCover && $i === 0 ? 1 : 0;
                
                $product->product_images()->create([
                    'url' => '/storage/' . $path,
                    'is_cover' => $isCoverForThisIteration, 
                    'sort_order' => $maxSortOrder + 1 + $i
                ]);
            }
        }

        if (!empty($validated['track_stock']) && $request->has('stock_quantity')) {
            $warehouseId = \App\Models\Warehouse::where('company_id', $product->company_id)->value('id') ?? 1;
            
            $stock = \App\Models\Stock::firstOrCreate(
                ['product_id' => $product->id, 'warehouse_id' => $warehouseId],
                ['quantity' => 0]
            );

            // If the requested quantity is different from what we have, we adjust
            $qtyDiff = $validated['stock_quantity'] - $stock->quantity;
            if ($qtyDiff != 0) {
                $stockBefore = $stock->quantity;
                $stock->update(['quantity' => $validated['stock_quantity']]);
                
                \App\Models\StockMovement::create([
                    'product_id' => $product->id,
                    'warehouse_id' => $warehouseId,
                    'user_id' => auth()->id(),
                    'type' => 'adjustment',
                    'quantity' => $qtyDiff,
                    'stock_before' => $stockBefore,
                    'stock_after' => $validated['stock_quantity'],
                    'note' => 'Ajuste manual desde edición de producto'
                ]);
            }
        }

        // --- VARIANTS PROCESSING ---
        if (!empty($validated['has_variants']) && !empty($validated['variants'])) {
            $variantsData = json_decode($validated['variants'], true);
            if (is_array($variantsData)) {
                $processedVariantIds = [];
                
                foreach ($variantsData as $variantItem) {
                    // Update or Create the variant
                    $variant = \App\Models\ProductVariant::updateOrCreate(
                        [
                            'product_id' => $product->id, 
                            'id' => $variantItem['id'] ?? null // if no id, it creates a new one
                        ],
                        [
                            'sku' => $variantItem['sku'] ?? null,
                            'price' => $variantItem['price'] ?? $product->price,
                            'cost_price' => $variantItem['cost_price'] ?? null,
                            'is_active' => $variantItem['is_active'] ?? 1,
                        ]
                    );
                    $processedVariantIds[] = $variant->id;

                    // Sync attributes
                    if (isset($variantItem['attributes']) && is_array($variantItem['attributes'])) {
                        $variant->variant_attribute_values()->delete(); // Clear old to put new

                        foreach ($variantItem['attributes'] as $attrName => $attrValueStr) {
                            $attribute = \App\Models\ProductAttribute::firstOrCreate(['name' => $attrName]);
                            $attrValue = \App\Models\ProductAttributeValue::firstOrCreate([
                                'attribute_id' => $attribute->id,
                                'value' => $attrValueStr
                            ]);
                            \App\Models\VariantAttributeValue::create([
                                'variant_id' => $variant->id,
                                'attribute_value_id' => $attrValue->id
                            ]);
                        }
                    }
                }

                // Delete variants that were removed from the frontend table
                \App\Models\ProductVariant::where('product_id', $product->id)
                    ->whereNotIn('id', $processedVariantIds)
                    ->delete();
            }
        } else {
            // Un-checked "has_variants" toggle -> delete all
            \App\Models\ProductVariant::where('product_id', $product->id)->delete();
        }
        // ---------------------------

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     * Note: Deleting images or actual file logic is omitted for simplicity in this migration
     */
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

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
                    // map other common fields if they exist
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
            'sql_file' => 'required|file|mimetypes:text/plain,application/sql'
        ]);

        try {
            $sql = file_get_contents($request->file('sql_file')->getRealPath());
            
            // Execute the raw SQL statements
            // WARNING: This execute raw SQL. Ensure the input file is trusted.
            \DB::unprepared($sql);

            return response()->json(['message' => 'Script SQL ejecutado con éxito.']);
        } catch (\Exception $e) {
            \Log::error('SQL Import Error: ' . $e->getMessage());
            return response()->json(['error' => 'Error ejecutando el script. Revisa el log de Laravel.'], 500);
        }
    }
}