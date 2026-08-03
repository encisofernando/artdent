<?php

namespace App\Console\Commands;

use App\Models\EcommerceOrder;
use App\Models\LoyaltyMove;
use App\Models\Sale;
use App\Services\LoyaltyService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Backfill único: acredita puntos de fidelización sobre TODAS las ventas
 * POS completadas y pedidos online pagados que ya existen en el sistema,
 * usando el % de acumulación configurado en /loyalty-settings para cada
 * empresa. Reusa exactamente la misma lógica de acreditación que corre en
 * vivo (LoyaltyService::accrueForSale/accrueForOrder) — idempotente por el
 * constraint único de loyalty_moves, así que correrlo más de una vez nunca
 * duplica puntos ya acreditados (ni por este comando ni por el flujo normal).
 */
class BackfillLoyaltyPoints extends Command
{
    protected $signature = 'loyalty:backfill
        {--company= : Limitar a un company_id puntual}
        {--dry-run : No confirma nada — corre todo dentro de una transacción y hace rollback al final}';

    protected $description = 'Acredita puntos de fidelización sobre las ventas/pedidos históricos ya cargados';

    public function handle(LoyaltyService $loyalty): int
    {
        $companyId = $this->option('company') ? (int) $this->option('company') : null;
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? 'Modo DRY-RUN — no se va a confirmar nada.' : 'Modo real — esto va a acreditar puntos de verdad.');

        $summary = ['sales' => 0, 'orders' => 0, 'skipped_sales' => 0, 'skipped_orders' => 0];
        $pointsBefore = (float) LoyaltyMove::where('type', LoyaltyMove::TYPE_ACCRUAL)->sum('amount');
        $pointsDuring = $pointsBefore;

        try {
            DB::transaction(function () use ($loyalty, $companyId, &$summary, &$pointsDuring) {
                $sales = Sale::query()
                    ->where('status', 'completed')
                    ->whereNotNull('customer_id')
                    ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
                    ->orderBy('id')
                    ->cursor();

                $bar = $this->output->createProgressBar();
                $bar->setFormat('Ventas POS: %current% [%bar%]');

                foreach ($sales as $sale) {
                    $alreadyAccrued = LoyaltyMove::where('reference_type', 'sale')
                        ->where('reference_id', $sale->id)
                        ->where('type', LoyaltyMove::TYPE_ACCRUAL)
                        ->exists();

                    $loyalty->accrueForSale($sale);

                    $alreadyAccrued ? $summary['skipped_sales']++ : $summary['sales']++;
                    $bar->advance();
                }
                $bar->finish();
                $this->newLine();

                $orders = EcommerceOrder::query()
                    ->where('payment_status', 'paid')
                    ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
                    ->orderBy('id')
                    ->cursor();

                $bar = $this->output->createProgressBar();
                $bar->setFormat('Pedidos online: %current% [%bar%]');

                foreach ($orders as $order) {
                    $alreadyAccrued = LoyaltyMove::where('reference_type', 'ecommerce_order')
                        ->where('reference_id', $order->id)
                        ->where('type', LoyaltyMove::TYPE_ACCRUAL)
                        ->exists();

                    $loyalty->accrueForOrder($order);

                    $alreadyAccrued ? $summary['skipped_orders']++ : $summary['orders']++;
                    $bar->advance();
                }
                $bar->finish();
                $this->newLine();

                $pointsDuring = (float) LoyaltyMove::where('type', LoyaltyMove::TYPE_ACCRUAL)->sum('amount');

                if ($this->option('dry-run')) {
                    throw new \RuntimeException('__DRY_RUN_ROLLBACK__');
                }
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() !== '__DRY_RUN_ROLLBACK__') {
                throw $e;
            }
            $this->warn('DRY-RUN: se hizo rollback, no se confirmó nada.');
        }

        $this->newLine();
        $this->table(
            ['Ventas POS acreditadas', 'Ventas ya acreditadas (saltadas)', 'Pedidos online acreditados', 'Pedidos ya acreditados (saltados)', 'Puntos totales otorgados'],
            [[
                $summary['sales'],
                $summary['skipped_sales'],
                $summary['orders'],
                $summary['skipped_orders'],
                '$'.number_format($pointsDuring - $pointsBefore, 2, ',', '.'),
            ]]
        );

        return 0;
    }
}
