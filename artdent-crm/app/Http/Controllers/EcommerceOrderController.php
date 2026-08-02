<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateEcommerceAfipCreditNoteJob;
use App\Jobs\GenerateEcommerceAfipInvoiceJob;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\Invoice;
use App\Models\Stock;
use App\Services\AndreaniService;
use App\Services\MercadoPagoRefundService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;

class EcommerceOrderController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');
        $status = $request->input('status', 'all');
        $payment = $request->input('payment', 'all');

        $query = EcommerceOrder::query()
            ->with(['customer', 'coupon'])
            ->withCount('ecommerce_order_items');

        if ($search) {
            $query->where(function ($q) use ($search): void {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($payment !== 'all') {
            $query->where('payment_status', $payment);
        }

        $items = $query->orderBy('id', 'desc')->paginate(20)->withQueryString();

        // KPIs globales sobre la consulta filtrada (sin paginación)
        // Excluye cancelados/reembolsados del facturado y por cobrar
        $activeQuery = EcommerceOrder::query()
            ->whereNotIn('status', ['cancelled', 'refunded']);

        // Aplicar los mismos filtros de búsqueda al query de KPIs
        if ($search) {
            $activeQuery->where(function ($q) use ($search): void {
                $q->where('order_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        $kpis = [
            'total_orders' => $items->total(),
            'total_billed' => (float) (clone $activeQuery)->sum('total'),
            'total_paid' => (float) (clone $activeQuery)->where('payment_status', 'paid')->sum('total'),
            'total_pending' => (float) (clone $activeQuery)->where('payment_status', 'pending')->sum('total'),
        ];

        return Inertia::render('EcommerceOrder/Index', [
            'items' => $items,
            'filters' => compact('search', 'status', 'payment'),
            'kpis' => $kpis,
        ]);
    }

    public function show(EcommerceOrder $ecommerceOrder)
    {
        $ecommerceOrder->load([
            'company',
            'customer',
            'coupon',
            'ecommerce_order_items.product.product_images',
            'shipments',
        ]);

        $invoice = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $ecommerceOrder->id)
            ->with('invoice_type')
            ->first();

        return Inertia::render('EcommerceOrder/Show', [
            'order' => $ecommerceOrder,
            'invoice' => $invoice,
        ]);
    }

    public function update(Request $request, EcommerceOrder $ecommerceOrder)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded,refund_failed',
            'admin_notes' => 'nullable|string|max:2000',
            'shipping_name' => 'nullable|string|max:255',
            'shipping_address' => 'nullable|string|max:500',
            'shipping_city' => 'nullable|string|max:100',
            'shipping_province' => 'nullable|string|max:100',
            'shipping_postal' => 'nullable|string|max:20',
            'shipping_phone' => 'nullable|string|max:30',
            'carrier' => 'nullable|string|max:100',
            'tracking_code' => 'nullable|string|max:255',
            'tracking_url' => 'nullable|url|max:500',
            'tracking_status' => 'nullable|in:preparing,shipped,in_transit,delivered,returned',
            'shipped_at' => 'nullable|date',
            'estimated_delivery' => 'nullable|date',
            'delivered_at' => 'nullable|date',
            'tracking_notes' => 'nullable|string|max:500',
        ]);

        $previousStatus = $ecommerceOrder->status;
        $newStatus = $validated['status'] ?? $previousStatus;
        $terminalStatuses = ['cancelled', 'refunded'];
        $wasTerminal = in_array($previousStatus, $terminalStatuses);
        $becomesTerminal = in_array($newStatus, $terminalStatuses);

        // Si cancela/reembolsa por primera vez y tiene factura AFIP, generar NC automáticamente
        $shouldGenerateCreditNote = $becomesTerminal && ! $wasTerminal
            && Invoice::query()
                ->where('reference_type', EcommerceOrder::class)
                ->where('reference_id', $ecommerceOrder->id)
                ->whereNotNull('cae')
                ->exists();

        // Return stock when transitioning to cancelled/refunded for the first time
        if ($becomesTerminal && ! $wasTerminal) {
            $warehouseId = (int) env('ECOMMERCE_WAREHOUSE_ID', 1);
            $ecommerceOrder->load('ecommerce_order_items');

            foreach ($ecommerceOrder->ecommerce_order_items as $item) {
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

            // Cancel pending payment automatically
            if ($ecommerceOrder->payment_status === 'pending') {
                $validated['payment_status'] = 'failed';
            } elseif ($ecommerceOrder->payment_status === 'paid') {
                $refunded = app(MercadoPagoRefundService::class)->refund($ecommerceOrder);

                if ($refunded) {
                    $validated['payment_status'] = 'refunded';
                    $validated['status'] = 'refunded';
                } else {
                    CrmNotification::create([
                        'type' => 'refund_failed',
                        'title' => 'Reembolso fallido',
                        'body' => "No se pudo reembolsar el pedido #{$ecommerceOrder->order_number}. Revisar manualmente en MercadoPago.",
                        'url' => '/ecommerce-orders/'.$ecommerceOrder->id,
                        'order_code' => $ecommerceOrder->order_number,
                    ]);
                }
            }
        }

        $previousPaymentStatus = $ecommerceOrder->payment_status;

        $ecommerceOrder->update($validated);

        // Disparar factura AFIP cuando el pago se confirma manualmente
        if (($validated['payment_status'] ?? null) === 'paid' && $previousPaymentStatus !== 'paid') {
            $hasInvoice = Invoice::query()
                ->where('reference_type', EcommerceOrder::class)
                ->where('reference_id', $ecommerceOrder->id)
                ->whereNotNull('cae')
                ->exists();

            if (! $hasInvoice) {
                try {
                    GenerateEcommerceAfipInvoiceJob::dispatch($ecommerceOrder->id);
                } catch (\Throwable) {
                    // El job loguea el error internamente; no bloqueamos la actualización
                }
            }
        }

        // Disparar NC AFIP cuando se cancela/reembolsa un pedido con factura autorizada
        if ($shouldGenerateCreditNote) {
            try {
                GenerateEcommerceAfipCreditNoteJob::dispatch($ecommerceOrder->id);
            } catch (\Throwable) {
                // El job loguea el error y genera notificación CRM; no bloqueamos la actualización
            }
        }

        // Handle shipment tracking
        $trackingData = array_filter([
            'carrier' => $request->input('carrier'),
            'tracking_code' => $request->input('tracking_code'),
            'tracking_url' => $request->input('tracking_url'),
            'status' => $request->input('tracking_status'),
            'shipped_at' => $request->input('shipped_at') ?: null,
            'estimated_delivery' => $request->input('estimated_delivery') ?: null,
            'delivered_at' => $request->input('delivered_at') ?: null,
            'notes' => $request->input('tracking_notes'),
        ], fn ($v) => $v !== null && $v !== '');

        if (! empty($trackingData)) {
            $shipment = $ecommerceOrder->shipments()->first();
            if ($shipment) {
                $shipment->update($trackingData);
            } else {
                $ecommerceOrder->shipments()->create($trackingData);
            }
        }

        return back()->with('success', 'Pedido actualizado.');
    }

    public function generateInvoice(EcommerceOrder $ecommerceOrder)
    {
        if ($ecommerceOrder->payment_status !== 'paid') {
            return back()->withErrors(['error' => 'Solo se puede facturar pedidos con pago confirmado.']);
        }

        $hasInvoice = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $ecommerceOrder->id)
            ->whereNotNull('cae')
            ->exists();

        if ($hasInvoice) {
            return back()->withErrors(['error' => 'El pedido ya tiene comprobante AFIP autorizado.']);
        }

        try {
            GenerateEcommerceAfipInvoiceJob::dispatch($ecommerceOrder->id);
        } catch (\Throwable $e) {
            return back()->withErrors(['error' => 'Error AFIP: '.$e->getMessage()]);
        }

        return back()->with('success', 'Comprobante AFIP en proceso. Se enviará por email al cliente.');
    }

    public function destroy(EcommerceOrder $ecommerceOrder)
    {
        $ecommerceOrder->delete();

        return redirect()->route('ecommerce-orders.index')->with('success', 'Pedido eliminado.');
    }

    /**
     * Da de alta el envío real en Andreani para este pedido. Tiene efecto en
     * el mundo real (Andreani planifica el retiro), por eso solo se dispara
     * desde una acción explícita del admin, nunca automáticamente.
     */
    public function createAndreaniShipment(EcommerceOrder $ecommerceOrder)
    {
        if ($ecommerceOrder->shipping_method_type !== 'home_delivery') {
            return back()->withErrors(['andreani' => 'Este pedido no es de envío a domicilio.']);
        }

        $existing = $ecommerceOrder->shipments()->where('carrier', 'andreani')->first();
        if ($existing) {
            return back()->withErrors(['andreani' => 'Este pedido ya tiene un envío de Andreani creado.']);
        }

        $resultado = (new AndreaniService)->crearOrdenParaPedido($ecommerceOrder);

        if (! $resultado['ok']) {
            return back()->withErrors(['andreani' => $resultado['message']]);
        }

        // El identificador que devuelve la orden (pedidoId) todavía no es un
        // número de tracking público válido — Andreani lo resuelve recién
        // cuando asigna el envío a un reparto real. Hasta entonces se guarda
        // como tracking_code (sirve para saber que la orden existe) pero sin
        // tracking_url, porque el link público no va a resolver todavía.
        $ecommerceOrder->shipments()->create([
            'carrier' => 'andreani',
            'tracking_code' => $resultado['numero'],
            'status' => 'preparing',
            'shipped_at' => now(),
        ]);

        return back()->with('success', 'Envío creado en Andreani correctamente.');
    }

    /**
     * Descarga la etiqueta PDF del envío de Andreani ya creado para este
     * pedido. La etiqueta se pide con el número de tracking real, no con el
     * pedidoId de la orden — hay que resolverlo primero contra /Shipments.
     */
    public function downloadAndreaniLabel(EcommerceOrder $ecommerceOrder): Response
    {
        $shipment = $ecommerceOrder->shipments()->where('carrier', 'andreani')->first();

        abort_unless($shipment && $shipment->tracking_code, 404, 'Este pedido no tiene un envío de Andreani creado.');

        $service = new AndreaniService;
        $trackingNumber = $this->resolveAndreaniTrackingNumber($service, $ecommerceOrder, $shipment);

        abort_unless($trackingNumber !== null, 409, 'Andreani todavía no asignó el envío a un reparto — todavía no se puede descargar la etiqueta. Probá de nuevo más tarde o actualizá el estado.');

        $pdf = $service->getEtiqueta($trackingNumber);

        abort_unless($pdf !== null, 502, 'No se pudo obtener la etiqueta de Andreani.');

        return response($pdf, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="etiqueta-'.$ecommerceOrder->order_number.'.pdf"',
        ]);
    }

    /**
     * Consulta contra Andreani el estado real del envío y actualiza el
     * tracking local — reemplaza la carga manual para pedidos con envío de
     * Andreani ya creado. Se consulta por el número de pedido de ArtDent
     * (el "remito" que se mandó al crear la orden), no por el pedidoId.
     */
    public function refreshAndreaniTracking(EcommerceOrder $ecommerceOrder)
    {
        $shipment = $ecommerceOrder->shipments()->where('carrier', 'andreani')->first();

        if (! $shipment || ! $shipment->tracking_code) {
            return back()->withErrors(['andreani' => 'Este pedido no tiene un envío de Andreani creado.']);
        }

        $info = (new AndreaniService)->consultarEnvio($ecommerceOrder->order_number);

        if ($info === null) {
            return back()->withErrors(['andreani' => 'No se pudo consultar el estado del envío en Andreani.']);
        }

        $trackingNumber = $info['trackingNumber'] ?? null;
        $mappedStatus = $this->mapAndreaniStatus($info['status'] ?? null);

        $update = array_filter([
            'status' => $mappedStatus,
        ], fn ($v) => $v !== null);

        if ($trackingNumber && $trackingNumber !== $shipment->tracking_code) {
            $update['tracking_code'] = $trackingNumber;
            $update['tracking_url'] = (new AndreaniService)->trackingUrl($trackingNumber);
        }

        if ($mappedStatus === 'delivered' && ! $shipment->delivered_at) {
            $update['delivered_at'] = now();
        }

        if (! empty($update)) {
            $shipment->update($update);
        }

        return back()->with('success', 'Estado del envío actualizado desde Andreani.');
    }

    /**
     * Resuelve el número de tracking real para pedir la etiqueta: si ya lo
     * tenemos guardado (post actualización de estado) lo usa directo; si no,
     * hace una consulta puntual contra /Shipments y lo persiste si aparece.
     */
    private function resolveAndreaniTrackingNumber(AndreaniService $service, EcommerceOrder $order, $shipment): ?string
    {
        $info = $service->consultarEnvio($order->order_number);
        $trackingNumber = $info['trackingNumber'] ?? null;

        if (! $trackingNumber) {
            return null;
        }

        if ($trackingNumber !== $shipment->tracking_code) {
            $shipment->update([
                'tracking_code' => $trackingNumber,
                'tracking_url' => $service->trackingUrl($trackingNumber),
            ]);
        }

        return $trackingNumber;
    }

    /**
     * Andreani no documenta públicamente los valores exactos de "status"
     * para /api/v1/Shipments — confirmado en vivo que el estado inicial es
     * "created" (en inglés). Se mapea de forma defensiva por palabra clave,
     * en español e inglés, y se deja sin tocar (null) el resto para no pisar
     * una carga manual con un valor no reconocido.
     */
    private function mapAndreaniStatus(?string $status): ?string
    {
        if (! $status) {
            return null;
        }

        $normalized = strtolower($status);

        return match (true) {
            str_contains($normalized, 'entreg'), str_contains($normalized, 'deliver') => 'delivered',
            str_contains($normalized, 'devuel'), str_contains($normalized, 'rechaz'), str_contains($normalized, 'return') => 'returned',
            str_contains($normalized, 'transito'), str_contains($normalized, 'tránsito'), str_contains($normalized, 'camino'), str_contains($normalized, 'transit') => 'in_transit',
            str_contains($normalized, 'retir'), str_contains($normalized, 'despach'), str_contains($normalized, 'enviad'), str_contains($normalized, 'shipped'), str_contains($normalized, 'dispatch') => 'shipped',
            str_contains($normalized, 'created'), str_contains($normalized, 'creado'), str_contains($normalized, 'pending') => 'preparing',
            default => null,
        };
    }

    // Kept for route completeness — not used
    public function create()
    {
        return redirect()->route('ecommerce-orders.index');
    }

    public function store(Request $request)
    {
        return redirect()->route('ecommerce-orders.index');
    }

    public function edit(EcommerceOrder $ecommerceOrder)
    {
        return redirect()->route('ecommerce-orders.show', $ecommerceOrder);
    }
}
