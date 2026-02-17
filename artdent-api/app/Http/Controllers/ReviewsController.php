<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use App\Models\EcommerceOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ReviewsController extends Controller
{
    /**
     * GET /api/products/{product}/reviews
     */
    public function index(Request $request, Product $product)
    {
        $perPage = min((int)$request->get('per_page', 10), 50);
        $rating = $request->get('rating'); // Filter by rating
        $verified = filter_var($request->get('verified_only', false), FILTER_VALIDATE_BOOLEAN);

        $query = Review::where('product_id', $product->id)
            ->approved()
            ->with('user')
            ->orderBy('created_at', 'desc');

        if ($rating) {
            $query->byRating((int)$rating);
        }

        if ($verified) {
            $query->verified();
        }

        $reviews = $query->paginate($perPage);

        // Add stats
        $stats = [
            'total' => Review::where('product_id', $product->id)->approved()->count(),
            'average_rating' => round(Review::where('product_id', $product->id)->approved()->avg('rating'), 1),
            'rating_breakdown' => [
                5 => Review::where('product_id', $product->id)->approved()->where('rating', 5)->count(),
                4 => Review::where('product_id', $product->id)->approved()->where('rating', 4)->count(),
                3 => Review::where('product_id', $product->id)->approved()->where('rating', 3)->count(),
                2 => Review::where('product_id', $product->id)->approved()->where('rating', 2)->count(),
                1 => Review::where('product_id', $product->id)->approved()->where('rating', 1)->count(),
            ],
        ];

        return response()->json([
            'reviews' => $reviews,
            'stats' => $stats,
        ]);
    }

    /**
     * POST /api/products/{product}/reviews
     */
    public function store(Request $request, Product $product)
    {
        $user = $request->user();
        $companyId = $product->company_id;

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:191',
            'comment' => 'nullable|string|max:2000',
            'images.*' => 'nullable|image|max:2048', // 2MB per image
            'order_id' => 'nullable|integer',
        ]);

        // Check if user already reviewed this product
        if ($user) {
            $existing = Review::where('product_id', $product->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existing) {
                return response()->json(['message' => 'Ya has valorado este producto.'], 422);
            }
        }

        $isVerifiedPurchase = false;
        if ($data['order_id'] ?? null) {
            $order = EcommerceOrder::find($data['order_id']);
            if ($order && $order->user_id === $user?->id) {
                $hasProduct = $order->items()->where('product_id', $product->id)->exists();
                $isVerifiedPurchase = $hasProduct;
            }
        }

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('reviews', 'public');
                $imagePaths[] = Storage::url($path);
            }
        }

        $review = Review::create([
            'company_id' => $companyId,
            'product_id' => $product->id,
            'user_id' => $user?->id,
            'order_id' => $data['order_id'] ?? null,
            'customer_name' => $user?->name ?? $request->get('customer_name'),
            'customer_email' => $user?->email ?? $request->get('customer_email'),
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'comment' => $data['comment'] ?? null,
            'images' => $imagePaths,
            'is_verified_purchase' => $isVerifiedPurchase,
            'is_approved' => true, // Auto-approve or use moderation queue
        ]);

        return response()->json($review, 201);
    }

    /**
     * POST /api/reviews/{review}/helpful
     */
    public function markAsHelpful(Request $request, Review $review)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $review->markAsHelpful($userId, $sessionId);

        return response()->json([
            'helpful_count' => $review->fresh()->helpful_count,
        ]);
    }

    /**
     * POST /api/reviews/{review}/not-helpful
     */
    public function markAsNotHelpful(Request $request, Review $review)
    {
        $userId = $request->user()?->id;
        $sessionId = $request->session()->getId();

        $review->markAsNotHelpful($userId, $sessionId);

        return response()->json([
            'not_helpful_count' => $review->fresh()->not_helpful_count,
        ]);
    }

    /**
     * POST /api/reviews/{review}/vendor-response (Admin only)
     */
    public function storeVendorResponse(Request $request, Review $review)
    {
        $data = $request->validate([
            'response' => 'required|string|max:1000',
        ]);

        $review->update([
            'vendor_response' => $data['response'],
            'vendor_response_at' => now(),
        ]);

        return response()->json($review);
    }
}
