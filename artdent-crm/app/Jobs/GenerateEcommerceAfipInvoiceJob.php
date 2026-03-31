<?php

namespace App\Jobs;

use App\Mail\InvoiceAfipMail;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Models\Invoice;
use App\Services\Afip\EcommerceInvoiceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class GenerateEcommerceAfipInvoiceJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(public readonly int $orderId) {}

    public function handle(): void
    {
        $order = EcommerceOrder::query()
            ->with(['company', 'customer', 'ecommerce_order_items'])
            ->find($this->orderId);

        if (! $order) {
            Log::warning('GenerateEcommerceAfipInvoiceJob: pedido no encontrado.', [
                'order_id' => $this->orderId,
            ]);

            return;
        }

        // Verificar si ya existe factura autorizada
        $existing = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $order->id)
            ->where('status', 'authorized')
            ->first();

        if ($existing) {
            Log::info('GenerateEcommerceAfipInvoiceJob: pedido ya tiene factura autorizada, se omite.', [
                'order_id' => $order->id,
                'invoice_id' => $existing->id,
            ]);

            return;
        }

        $service = new EcommerceInvoiceService;
        $invoice = $service->generateInvoice($order);

        // Enviar email con el comprobante adjunto
        $email = $order->guest_email ?? $order->customer?->email;
        $name = $order->shipping_name ?? $order->customer?->name ?? 'Cliente';

        if ($email) {
            try {
                Mail::to($email)->send(new InvoiceAfipMail($order, $invoice, $email, $name));
            } catch (Throwable $e) {
                Log::warning('GenerateEcommerceAfipInvoiceJob: fallo al enviar email de comprobante.', [
                    'order_id' => $order->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function failed(Throwable $e): void
    {
        Log::error('GenerateEcommerceAfipInvoiceJob: falló para el pedido.', [
            'order_id' => $this->orderId,
            'error' => $e->getMessage(),
        ]);

        CrmNotification::create([
            'type' => 'afip_invoice_error',
            'title' => 'Error al generar factura AFIP (e-commerce)',
            'body' => "Pedido #{$this->orderId}: ".$e->getMessage(),
            'url' => '/ecommerce-orders/'.$this->orderId,
        ]);
    }
}
