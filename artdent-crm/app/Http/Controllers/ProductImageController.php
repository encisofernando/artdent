<?php

namespace App\Http\Controllers;

use App\Models\ProductImage;
use Illuminate\Support\Facades\Storage;

class ProductImageController extends Controller
{
    /**
     * Remove the specified image from storage and from the database.
     * Called via DELETE /product-images/{productImage} (API o Inertia).
     *
     * Tras eliminar, si la imagen era portada y quedan más imágenes del
     * producto, se promueve automáticamente la de menor sort_order.
     */
    public function destroy(ProductImage $productImage)
    {
        $product = $productImage->product;

        // Borrar archivo físico
        $relativePath = ltrim(str_replace('/storage/', '', $productImage->url), '/');
        if (Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        $wasCover = (bool) $productImage->is_cover;

        $productImage->delete();

        // Si la imagen borrada era la portada, promover la siguiente
        if ($wasCover && $product) {
            $next = $product->product_images()->orderBy('sort_order')->first();
            if ($next) {
                $next->update(['is_cover' => 1]);
            }
        }

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'Imagen eliminada.');
    }
}
