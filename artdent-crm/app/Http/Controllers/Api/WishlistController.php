<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $items = Wishlist::query()
            ->where('customer_id', $request->user()->id)
            ->with(['product.product_images'])
            ->get()
            ->map(fn (Wishlist $item): array => $this->format($item));

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['product_id' => ['required', 'integer', 'exists:products,id']]);

        $item = Wishlist::firstOrCreate([
            'customer_id' => $request->user()->id,
            'product_id' => $request->integer('product_id'),
        ]);

        return response()->json($this->format($item->load('product.product_images')), 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        Wishlist::query()
            ->where('id', $id)
            ->where('customer_id', $request->user()->id)
            ->delete();

        return response()->json(['ok' => true]);
    }

    public function check(Request $request, int $productId): JsonResponse
    {
        $item = Wishlist::query()
            ->where('customer_id', $request->user()->id)
            ->where('product_id', $productId)
            ->first();

        return response()->json([
            'in_wishlist' => $item !== null,
            'wishlist_id' => $item?->id,
        ]);
    }

    private function format(Wishlist $item): array
    {
        $product = $item->product;
        $primaryImage = $product?->product_images?->firstWhere('is_cover', true)?->url
            ?? $product?->product_images?->first()?->url;

        return [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'created_at' => $item->created_at,
            'product' => $product ? [
                'id' => $product->id,
                'name' => $product->name,
                'price' => $product->price,
                'price_final' => $product->compare_price ?? $product->price,
                'primary_image_url' => $primaryImage,
                'category' => $product->category ? [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ] : null,
            ] : null,
        ];
    }
}
