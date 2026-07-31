<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\GenerateEcommerceAfipCreditNoteJob;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\EcommercePaymentReport;
use App\Models\Invoice;
use App\Models\Stock;
use App\Services\MercadoPagoRefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
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
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')->ignore($request->user()->id)->whereNotNull('phone')],
            'dni' => ['nullable', 'string', 'max:20', Rule::unique('customers', 'dni')->ignore($request->user()->id)->whereNotNull('dni')],
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
            ->with(['ecommerce_order_items', 'shipments', 'paymentReport'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($order) => $this->formatOrder($order));

        return response()->json($orders);
    }

    public function orderDetail(Request $request, string $code): JsonResponse
    {
        $order = $request->user()
            ->ecommerce_orders()
            ->with(['ecommerce_order_items', 'shipments', 'paymentReport'])
            ->where('order_number', $code)
            ->firstOrFail();

        return response()->json($this->formatOrder($order));
    }

    public function storePaymentReport(Request $request, string $code): JsonResponse
    {
        $order = $request->user()
            ->ecommerce_orders()
            ->where('order_number', $code)
            ->firstOrFail();

        if ($order->selected_payment_method !== 'bank_transfer') {
            return response()->json(['message' => 'Este pedido no usa transferencia bancaria.'], 422);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['message' => 'El pedido ya fue marcado como pagado.'], 422);
        }

        $request->validate([
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:8192'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        // Delete old image if re-submitting
        $existing = $order->paymentReport()->first();
        if ($existing) {
            Storage::disk('public')->delete($existing->image_path);
            $existing->delete();
        }

        $path = $request->file('image')->store('payment_reports', 'public');

        $report = EcommercePaymentReport::create([
            'order_id' => $order->id,
            'image_path' => $path,
            'notes' => $request->input('notes'),
            'status' => 'pending',
        ]);

        CrmNotification::create([
            'type' => 'payment_report',
            'title' => 'Comprobante de pago recibido',
            'body' => "El cliente envió un comprobante para el pedido #{$order->order_number}",
            'url' => '/ecommerce-orders/'.$order->id,
            'order_code' => $order->order_number,
        ]);

        return response()->json($this->formatPaymentReport($report), 201);
    }

    public function changePaymentMethod(Request $request, string $code): JsonResponse
    {
        $validated = $request->validate([
            'selected_payment_method' => ['required', 'string', 'in:mercadopago,bank_transfer,qr,cash,nave'],
        ]);

        $order = $request->user()
            ->ecommerce_orders()
            ->with(['ecommerce_order_items', 'shipments'])
            ->where('order_number', $code)
            ->firstOrFail();

        if (\in_array($order->status, ['cancelled', 'refunded', 'delivered'])) {
            return response()->json([
                'message' => 'No se puede cambiar el método de pago de este pedido.',
            ], 422);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'message' => 'El pedido ya fue pagado.',
            ], 422);
        }

        if ($validated['selected_payment_method'] === 'cash' &&
            \in_array($order->shipping_method_type, ['home_delivery', 'moto'])) {
            return response()->json([
                'message' => 'El pago en efectivo no está disponible para este método de envío.',
            ], 422);
        }

        $order->update(['selected_payment_method' => $validated['selected_payment_method']]);

        return response()->json($this->formatOrder($order->fresh(['ecommerce_order_items', 'shipments'])));
    }

    public function cancelOrder(Request $request, string $code): JsonResponse
    {
        $order = $request->user()
            ->ecommerce_orders()
            ->with(['ecommerce_order_items', 'shipments'])
            ->where('order_number', $code)
            ->firstOrFail();

        if (in_array($order->status, ['shipped', 'delivered', 'cancelled', 'refunded'])) {
            return response()->json([
                'message' => 'Este pedido no puede cancelarse en su estado actual.',
            ], 422);
        }

        if ($order->created_at->lt(now()->subHour())) {
            return response()->json([
                'message' => 'El plazo de cancelación de 1 hora ya venció.',
            ], 422);
        }

        // Restore stock for each item
        $warehouseId = (int) env('ECOMMERCE_WAREHOUSE_ID', 1);

        foreach ($order->ecommerce_order_items as $item) {
            Stock::query()
                ->where('product_id', $item->product_id)
                ->where('warehouse_id', $warehouseId)
                ->when(
                    $item->variant_id === null,
                    fn ($q) => $q->whereNull('variant_id'),
                    fn ($q) => $q->where('variant_id', $item->variant_id)
                )
                ->increment('quantity', $item->quantity);
        }

        $orderUpdates = ['status' => 'cancelled'];

        if ($order->payment_status === 'pending') {
            $orderUpdates['payment_status'] = 'failed';
        } elseif ($order->payment_status === 'paid') {
            $refunded = app(MercadoPagoRefundService::class)->refund($order);

            if ($refunded) {
                $orderUpdates['status'] = 'refunded';
                // payment_status already updated to 'refunded' by the service
            } else {
                CrmNotification::create([
                    'type' => 'refund_failed',
                    'title' => 'Reembolso fallido',
                    'body' => "No se pudo reembolsar el pedido #{$order->order_number}. Revisar manualmente en MercadoPago.",
                    'url' => '/ecommerce-orders/'.$order->id,
                    'order_code' => $order->order_number,
                ]);
            }
        }

        // Verificar si tiene factura AFIP antes de actualizar (para generar NC después)
        $hasAfipInvoice = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $order->id)
            ->whereNotNull('cae')
            ->exists();

        $order->update($orderUpdates);

        // Generar NC AFIP automáticamente si el pedido tenía factura autorizada
        if ($hasAfipInvoice) {
            try {
                GenerateEcommerceAfipCreditNoteJob::dispatch($order->id);
            } catch (\Throwable) {
                // El job loguea el error y genera notificación CRM
            }
        }

        CrmNotification::create([
            'type' => 'order_cancelled',
            'title' => 'Pedido cancelado',
            'body' => "El cliente canceló el pedido #{$order->order_number}",
            'url' => '/ecommerce-orders/'.$order->id,
            'order_code' => $order->order_number,
        ]);

        return response()->json($this->formatOrder($order->fresh(['ecommerce_order_items', 'shipments'])));
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
            'shipping_method_type' => $order->shipping_method_type,
            'selected_payment_method' => $order->selected_payment_method,
            'created_at' => $order->created_at?->toIso8601String(),
            'can_cancel' => ! \in_array($order->status, ['shipped', 'delivered', 'cancelled', 'refunded'])
                && $order->created_at?->gt(now()->subHour()),
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
                'tracking_url' => $shipment->tracking_url,
                'status' => $shipment->status,
                'shipped_at' => $shipment->shipped_at,
                'estimated_delivery' => $shipment->estimated_delivery,
                'delivered_at' => $shipment->delivered_at,
                'notes' => $shipment->notes,
            ] : null,
            'payment_report' => $order->paymentReport
                ? $this->formatPaymentReport($order->paymentReport)
                : null,
        ];
    }

    /** @return array<string, mixed> */
    private function formatPaymentReport(EcommercePaymentReport $report): array
    {
        return [
            'id' => $report->id,
            'status' => $report->status,
            'notes' => $report->notes,
            'image_url' => Storage::disk('public')->url($report->image_path),
            'submitted_at' => $report->created_at?->toIso8601String(),
        ];
    }
}
