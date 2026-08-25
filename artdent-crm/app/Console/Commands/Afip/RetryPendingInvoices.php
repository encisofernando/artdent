<?php

namespace App\Console\Commands\Afip;

use App\Jobs\GenerateAfipInvoiceJob;
use App\Models\Sale;
use Illuminate\Console\Command;

class RetryPendingInvoices extends Command
{
    protected $signature = 'afip:retry-pending-invoices';

    protected $description = 'Reintenta facturar en AFIP las ventas que quedaron como ticket X por un corte/timeout de comunicación';

    public function handle(): int
    {
        $sales = Sale::query()
            ->whereNotNull('afip_pending_receipt_type')
            ->whereNull('invoice_id')
            ->get(['id', 'afip_pending_receipt_type']);

        if ($sales->isEmpty()) {
            return Command::SUCCESS;
        }

        foreach ($sales as $sale) {
            GenerateAfipInvoiceJob::dispatch($sale->id, $sale->afip_pending_receipt_type);
        }

        $this->info("Facturas AFIP reintentadas: {$sales->count()}");

        return Command::SUCCESS;
    }
}
