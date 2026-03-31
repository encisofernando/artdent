<?php

namespace App\Jobs;

use App\Models\Sale;
use App\Services\Afip\AfipService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateAfipInvoiceJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 120;

    public function __construct(
        public readonly int $saleId,
        public readonly string $receiptKey,  // FA, FB, FC, NCA, NCB …
    ) {}

    public function handle(): void
    {
        $sale = Sale::with(['company', 'sale_items', 'customer'])->find($this->saleId);

        if (! $sale) {
            Log::warning("GenerateAfipInvoiceJob: Venta #{$this->saleId} no encontrada.");

            return;
        }

        if ($sale->invoice_id) {
            Log::info("GenerateAfipInvoiceJob: Venta #{$this->saleId} ya tiene factura, se omite.");

            return;
        }

        $service = new AfipService($sale->company);
        $service->generateFromSale($sale, $this->receiptKey);

        // Actualizar receipt_type al tipo AFIP generado exitosamente
        $sale->update(['receipt_type' => $this->receiptKey]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error("GenerateAfipInvoiceJob falló para venta #{$this->saleId}", [
            'receipt_key' => $this->receiptKey,
            'error' => $exception->getMessage(),
        ]);

        // Revertir a ticket X para que el operador pueda reintentar manualmente
        Sale::where('id', $this->saleId)
            ->whereNull('invoice_id')
            ->update(['receipt_type' => 'X']);
    }
}
