<?php

namespace App\Http\Controllers;

use App\Models\OrderTracking;
use App\Models\EcommerceOrder;
use Illuminate\Http\Request;

class OrderTrackingController extends Controller
{
    public function show(Request $request, EcommerceOrder $order)
    {
        $user = $request->user();

        if ($order->user_id !== $user?->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $tracking = OrderTracking::where('order_id', $order->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'order' => $order,
            'tracking' => $tracking,
        ]);
    }

    public function myOrders(Request $request)
    {
        $user = $request->user();
        $perPage = min((int)$request->get('per_page', 10), 50);

        $orders = EcommerceOrder::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($orders);
    }

    public function addUpdate(Request $request, EcommerceOrder $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,in_transit,out_for_delivery,delivered,cancelled,refunded',
            'notes' => 'nullable|string',
            'location' => 'nullable|string',
            'estimated_delivery' => 'nullable|date',
            'carrier' => 'nullable|string',
            'tracking_number' => 'nullable|string',
            'tracking_url' => 'nullable|url',
        ]);

        $tracking = OrderTracking::create([
            'order_id' => $order->id,
            'updated_by_user_id' => $request->user()->id,
            ...$data,
        ]);

        // Update order current status
        $order->update(['current_status' => $data['status']]);

        // TODO: Send notification to customer

        return response()->json($tracking, 201);
    }
}
