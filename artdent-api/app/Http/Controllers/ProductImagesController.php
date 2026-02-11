<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProductImagesController extends Controller
{
    public function index(Product $product)
    {
        return response()->json($product->images()->get());
    }

    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'image' => ['required', 'file', 'image', 'max:4096'], // 4MB
            'alt' => ['nullable', 'string', 'max:191'],
            'is_primary' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:9999'],
        ]);

        $companyId = (int) $product->company_id;
        $file = $request->file('image');

        $dir = "products/{$product->id}";
        $path = $file->storePublicly($dir, 'public');

        $img = null;
        DB::transaction(function () use (&$img, $companyId, $product, $validated, $path) {
            $makePrimary = (bool) ($validated['is_primary'] ?? false);

            if ($makePrimary) {
                ProductImage::query()
                    ->where('product_id', $product->id)
                    ->update(['is_primary' => 0]);
            }

            $img = ProductImage::query()->create([
                'company_id' => $companyId,
                'product_id' => $product->id,
                'path' => $path,
                'alt' => $validated['alt'] ?? null,
                'sort_order' => (int) ($validated['sort_order'] ?? 0),
                'is_primary' => $makePrimary,
            ]);

            // Si es la primera imagen, marcarla como principal automáticamente
            if (!$makePrimary) {
                $hasPrimary = ProductImage::query()
                    ->where('product_id', $product->id)
                    ->where('is_primary', 1)
                    ->exists();

                if (!$hasPrimary) {
                    $img->is_primary = true;
                    $img->save();
                }
            }
        });

        return response()->json($img->fresh(), 201);
    }

    public function setPrimary(Product $product, ProductImage $image)
    {
        if ((int) $image->product_id !== (int) $product->id) {
            return response()->json(['message' => 'Imagen inválida'], 422);
        }

        DB::transaction(function () use ($product, $image) {
            ProductImage::query()->where('product_id', $product->id)->update(['is_primary' => 0]);
            $image->is_primary = true;
            $image->save();
        });

        return response()->json($image->fresh());
    }

    public function destroy(Product $product, ProductImage $image)
    {
        if ((int) $image->product_id !== (int) $product->id) {
            return response()->json(['message' => 'Imagen inválida'], 422);
        }

        DB::transaction(function () use ($product, $image) {
            $wasPrimary = (bool) $image->is_primary;
            $path = $image->path;
            $image->delete();
            Storage::disk('public')->delete($path);

            if ($wasPrimary) {
                $next = ProductImage::query()->where('product_id', $product->id)->orderBy('sort_order')->orderBy('id')->first();
                if ($next) {
                    $next->is_primary = true;
                    $next->save();
                }
            }
        });

        return response()->json(['ok' => true]);
    }
}
