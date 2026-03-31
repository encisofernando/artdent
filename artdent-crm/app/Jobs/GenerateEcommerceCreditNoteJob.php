<?php

namespace App\Jobs;

use App\Mail\InvoiceAfipMail;
use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Services\Afip\EcommerceInvoiceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class GenerateEcommerceCreditNoteJob implements ShouldQueue
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
            Log::warning('GenerateEcommerceCreditNoteJob: pedido no encontrado.', [
                'order_id' => $this->orderId,
            ]);

            return;
        }

        $service = new EcommerceInvoiceService;
        $ncInvoice = $service->generateCreditNote($order);

        // Enviar email con la nota de crédito adjunta
        $email = $order->guest_email ?? $order->customer?->email;
        $name = $order->shipping_name ?? $order->customer?->name ?? 'Cliente';

        if ($email) {
            try {
                Mail::to($email)->send(new InvoiceAfipMail($order, $ncInvoice, $email, $name));
            } catch (Throwable $e) {
                Log::warning('GenerateEcommerceCreditNoteJob: fallo al enviar email de nota de crédito.', [
                    'order_id' => $order->id,
                    'email' => $email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }

    public function failed(Throwable $e): void
    {
        Log::error('GenerateEcommerceCreditNoteJob: falló para el pedido.', [
            'order_id' => $this->orderId,
            'error' => $e->getMessage(),
        ]);

        CrmNotification::create([
            'type' => 'afip_invoice_error',
            'title' => 'Error al generar Nota de Crédito AFIP (e-commerce)',
            'body' => "Pedido #{$this->orderId}: ".$e->getMessage(),
            'url' => '/ecommerce-orders/'.$this->orderId,
        ]);
    }
}
