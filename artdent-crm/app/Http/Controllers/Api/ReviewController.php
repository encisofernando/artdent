<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\Review;
use App\Services\ProfanityFilter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request, int $productId): JsonResponse
    {
        $query = Review::query()
            ->where('product_id', $productId)
            ->where('status', 'approved')
            ->with('customer');

        if ($request->boolean('verified_only')) {
            $query->whereNotNull('order_id');
        }

        if ($rating = $request->integer('rating')) {
            $query->where('rating', $rating);
        }

        $paginated = $query->latest()->paginate(10);

        $allApproved = Review::query()
            ->where('product_id', $productId)
            ->where('status', 'approved')
            ->get(['rating']);

        $breakdown = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        foreach ($allApproved as $r) {
            $breakdown[$r->rating] = ($breakdown[$r->rating] ?? 0) + 1;
        }

        $total = $allApproved->count();
        $average = $total > 0 ? round($allApproved->avg('rating'), 1) : 0;

        $items = $paginated->getCollection()->map(fn (Review $review): array => $this->format($review));

        return response()->json([
            'reviews' => [
                'data' => $items,
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'total' => $paginated->total(),
            ],
            'stats' => [
                'total' => $total,
                'average_rating' => $average,
                'rating_breakdown' => $breakdown,
            ],
        ]);
    }

    public function store(Request $request, int $productId): JsonResponse
    {
        $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:191'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        $customer = $request->user('customer');

        $orderId = EcommerceOrder::query()
            ->where('customer_id', $customer->id)
            ->whereHas('ecommerce_order_items', fn ($q) => $q->where('product_id', $productId))
            ->value('id');

        $title = $request->input('title') ?? '';
        $body = $request->input('comment') ?? '';

        // Auto-aprobar si el contenido es apropiado; dejar pendiente para moderación si no.
        $status = ProfanityFilter::contains($title, $body) ? 'pending' : 'approved';

        $review = Review::create([
            'product_id' => $productId,
            'customer_id' => $customer->id,
            'order_id' => $orderId,
            'rating' => $request->integer('rating'),
            'title' => $title ?: null,
            'body' => $body ?: null,
            'status' => $status,
        ]);

        $loaded = $review->load(['customer', 'product']);
        $productName = $loaded->product?->name ?? "Producto #{$productId}";
        $stars = str_repeat('★', $review->rating).str_repeat('☆', 5 - $review->rating);

        CrmNotification::create([
            'type' => 'new_review',
            'title' => 'Nueva reseña',
            'body' => "{$customer->name} dejó {$stars} en {$productName}",
            'url' => '/reviews/'.$review->id,
            'order_code' => null,
        ]);

        return response()->json([
            ...$this->format($loaded),
            'pending_review' => $status === 'pending',
        ], 201);
    }

    public function markHelpful(int $reviewId): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    public function markNotHelpful(int $reviewId): JsonResponse
    {
        return response()->json(['ok' => true]);
    }

    private function format(Review $review): array
    {
        return [
            'id' => $review->id,
            'product_id' => $review->product_id,
            'user_id' => $review->customer_id,
            'rating' => $review->rating,
            'title' => $review->title,
            'comment' => $review->body,
            'images' => [],
            'is_verified_purchase' => $review->order_id !== null,
            'is_approved' => $review->status === 'approved',
            'helpful_count' => 0,
            'not_helpful_count' => 0,
            'vendor_response' => null,
            'vendor_response_at' => null,
            'customer_display_name' => $review->customer?->name ?? 'Anónimo',
            'created_at' => $review->created_at,
        ];
    }
}
