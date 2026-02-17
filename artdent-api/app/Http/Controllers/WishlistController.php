<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    /**
     * GET /api/wishlist
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $wishlist = Wishlist::where('user_id', $user->id)
            ->with(['product' => function ($q) {
                $q->with('primaryImage');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($wishlist);
    }

    /**
     * POST /api/wishlist
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'notes' => 'nullable|string|max:500',
            'price_alert' => 'nullable|numeric|min:0',
            'notify_back_in_stock' => 'nullable|boolean',
        ]);

        $product = Product::findOrFail($data['product_id']);

        // Check if already in wishlist
        $existing = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'El producto ya está en tu lista de deseos.'], 422);
        }

        $wishlist = Wishlist::create([
            'company_id' => $product->company_id,
            'user_id' => $user->id,
            'product_id' => $product->id,
            'notes' => $data['notes'] ?? null,
            'price_alert' => $data['price_alert'] ?? null,
            'notify_back_in_stock' => $data['notify_back_in_stock'] ?? false,
        ]);

        return response()->json($wishlist->load('product'), 201);
    }

    /**
     * DELETE /api/wishlist/{wishlist}
     */
    public function destroy(Request $request, Wishlist $wishlist)
    {
        $user = $request->user();

        if ($wishlist->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $wishlist->delete();

        return response()->json(['message' => 'Producto eliminado de la lista de deseos.']);
    }

    /**
     * PUT /api/wishlist/{wishlist}
     */
    public function update(Request $request, Wishlist $wishlist)
    {
        $user = $request->user();

        if ($wishlist->user_id !== $user->id) {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $data = $request->validate([
            'notes' => 'nullable|string|max:500',
            'price_alert' => 'nullable|numeric|min:0',
            'notify_back_in_stock' => 'nullable|boolean',
        ]);

        $wishlist->update($data);

        return response()->json($wishlist->fresh());
    }

    /**
     * GET /api/wishlist/check/{product}
     */
    public function check(Request $request, Product $product)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['in_wishlist' => false]);
        }

        $inWishlist = Wishlist::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        return response()->json(['in_wishlist' => $inWishlist]);
    }
}
