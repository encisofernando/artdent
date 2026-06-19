<?php

namespace App\Jobs;

use App\Models\CrmNotification;
use App\Models\EcommerceOrder;
use App\Services\Afip\EcommerceInvoiceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateEcommerceAfipCreditNoteJob implements ShouldQueue
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
            Log::warning('GenerateEcommerceAfipCreditNoteJob: pedido no encontrado.', [
                'order_id' => $this->orderId,
            ]);

            return;
        }

        $service = new EcommerceInvoiceService;
        $ncInvoice = $service->generateCreditNote($order);

        Log::info('GenerateEcommerceAfipCreditNoteJob: NC generada OK.', [
            'order_id' => $order->id,
            'invoice_id' => $ncInvoice->id,
            'cae' => $ncInvoice->cae,
        ]);
    }

    public function failed(Throwable $e): void
    {
        Log::error('GenerateEcommerceAfipCreditNoteJob: falló para el pedido.', [
            'order_id' => $this->orderId,
            'error' => $e->getMessage(),
        ]);

        CrmNotification::create([
            'type' => 'afip_credit_note_error',
            'title' => 'Error al generar Nota de Crédito AFIP (e-commerce)',
            'body' => "Pedido #{$this->orderId}: ".$e->getMessage(),
            'url' => '/ecommerce-orders/'.$this->orderId,
        ]);
    }
}
