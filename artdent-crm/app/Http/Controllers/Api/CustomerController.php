<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class CustomerController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        return response()->json($this->formatCustomer($request->user()));
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'dni' => ['nullable', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'accepts_marketing' => ['nullable', 'boolean'],
        ]);

        $request->user()->update($validated);

        return response()->json($this->formatCustomer($request->user()->fresh()));
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($request->current_password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La contraseña actual no es correcta.'],
            ]);
        }

        $request->user()->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Contraseña actualizada.']);
    }

    public function orders(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->ecommerce_orders()
            ->with(['ecommerce_order_items', 'shipments'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($order) => $this->formatOrder($order));

        return response()->json($orders);
    }

    public function orderDetail(Request $request, string $code): JsonResponse
    {
        $order = $request->user()
            ->ecommerce_orders()
            ->with(['ecommerce_order_items', 'shipments'])
            ->where('order_number', $code)
            ->firstOrFail();

        return response()->json($this->formatOrder($order));
    }

    public function addresses(Request $request): JsonResponse
    {
        return response()->json($request->user()->customer_addresses()->get());
    }

    public function storeAddress(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:64'],
            'recipient' => ['required', 'string', 'max:191'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:64'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        if (! empty($validated['is_default'])) {
            $request->user()->customer_addresses()->update(['is_default' => false]);
        }

        $address = $request->user()->customer_addresses()->create($validated);

        return response()->json($address, 201);
    }

    public function updateAddress(Request $request, int $id): JsonResponse
    {
        $address = $request->user()->customer_addresses()->findOrFail($id);

        $validated = $request->validate([
            'label' => ['nullable', 'string', 'max:64'],
            'recipient' => ['required', 'string', 'max:191'],
            'address' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:100'],
            'province' => ['required', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:64'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        if (! empty($validated['is_default'])) {
            $request->user()->customer_addresses()->where('id', '!=', $id)->update(['is_default' => false]);
        }

        $address->update($validated);

        return response()->json($address);
    }

    public function destroyAddress(Request $request, int $id): JsonResponse
    {
        $request->user()->customer_addresses()->findOrFail($id)->delete();

        return response()->json(['message' => 'Dirección eliminada.']);
    }

    /** @return array<string, mixed> */
    private function formatCustomer(\App\Models\Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'dni' => $customer->dni,
            'address' => $customer->address,
            'city' => $customer->city,
            'province' => $customer->province,
            'postal_code' => $customer->postal_code,
            'accepts_marketing' => $customer->accepts_marketing,
            'created_at' => $customer->created_at?->toIso8601String(),
        ];
    }

    /** @return array<string, mixed> */
    private function formatOrder(\App\Models\EcommerceOrder $order): array
    {
        $shipment = $order->shipments->first();

        return [
            'id' => $order->id,
            'code' => $order->order_number,
            'status' => $order->status ?? 'pending',
            'payment_status' => $order->payment_status ?? 'pending',
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount,
            'shipping_cost' => $order->shipping_cost,
            'tax_amount' => $order->tax_amount,
            'total' => $order->total,
            'shipping_name' => $order->shipping_name,
            'shipping_address' => $order->shipping_address,
            'shipping_city' => $order->shipping_city,
            'shipping_province' => $order->shipping_province,
            'shipping_postal' => $order->shipping_postal,
            'shipping_phone' => $order->shipping_phone,
            'customer_notes' => $order->customer_notes,
            'created_at' => $order->created_at?->toIso8601String(),
            'items' => $order->ecommerce_order_items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'name' => $item->product_name,
                'sku' => $item->sku,
                'qty' => $item->quantity,
                'unit_price' => $item->unit_price,
                'tax_rate' => $item->tax_rate,
                'total' => $item->total,
            ])->values(),
            'tracking' => $shipment ? [
                'carrier' => $shipment->carrier,
                'tracking_code' => $shipment->tracking_code,
                'status' => $shipment->status,
                'shipped_at' => $shipment->shipped_at,
                'estimated_delivery' => $shipment->estimated_delivery,
                'delivered_at' => $shipment->delivered_at,
                'notes' => $shipment->notes,
            ] : null,
        ];
    }
}
