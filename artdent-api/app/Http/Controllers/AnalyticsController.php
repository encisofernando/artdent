<?php

namespace App\Http\Controllers;

use App\Models\ProductAnalytics;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsController extends Controller
{
    /**
     * POST /api/analytics/product-view
     */
    public function productView(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'source' => 'nullable|string|max:255',
            'search_query' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $this->trackEvent($request, 'view', $data);
        return response()->json(['message' => 'Evento registrado.']);
    }

    /**
     * POST /api/analytics/product-click
     */
    public function productClick(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'source' => 'nullable|string|max:255',
            'search_query' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $this->trackEvent($request, 'click', $data);
        return response()->json(['message' => 'Evento registrado.']);
    }

    /**
     * POST /api/analytics/add-to-cart
     */
    public function addToCart(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'nullable|integer|min:1',
            'source' => 'nullable|string|max:255',
            'search_query' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        $this->trackEvent($request, 'add_to_cart', $data);
        return response()->json(['message' => 'Evento registrado.']);
    }

    /**
     * POST /api/analytics/purchase
     */
    public function purchase(Request $request)
    {
        $data = $request->validate([
            'order_id' => 'required|integer|exists:ecommerce_orders,id',
            'source' => 'nullable|string|max:255',
            'search_query' => 'nullable|string|max:255',
            'metadata' => 'nullable|array',
        ]);

        // El esquema requiere product_id NOT NULL.
        // Registramos la compra por cada ítem del pedido.
        $items = \App\Models\EcommerceOrderItem::query()
            ->where('order_id', $data['order_id'])
            ->get(['product_id', 'qty']);

        foreach ($items as $item) {
            $this->trackEvent($request, 'purchase', [
                'product_id' => $item->product_id,
                'source' => $data['source'] ?? null,
                'search_query' => $data['search_query'] ?? null,
                'metadata' => array_merge($data['metadata'] ?? [], [
                    'order_id' => $data['order_id'],
                    'qty' => $item->qty,
                ]),
            ]);
        }

        return response()->json(['message' => 'Evento registrado.']);
    }

    private function trackEvent(Request $request, string $eventType, array $data)
    {
        $userId = optional($request->user())->id;

        $sessionId = $request->header('X-Session-Id');
        if (!$sessionId) {
            $sessionId = (string) Str::uuid();
        }

        ProductAnalytics::create([
            'product_id' => $data['product_id'],
            'user_id' => $userId,
            'session_id' => $sessionId,
            'event_type' => $eventType,
            'source' => $data['source'] ?? null,
            'search_query' => $data['search_query'] ?? null,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }
}
