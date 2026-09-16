<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Models\JobPhaseProgress;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class SyncJobAccountCharges extends Command
{
    protected $signature = 'sync:job-account-charges {--dry-run : Mostrar cambios sin aplicarlos en base de datos}';

    protected $description = 'Regulariza los cargos de cuenta corriente para todas las órdenes activas que no fueron facturadas';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? '=== MODO SIMULACIÓN (--dry-run) ===' : '=== REGULARIZANDO CARGOS DE CUENTAS CORRIENTES ===');

        // Buscar todas las órdenes activas que no tengan cargo Job::class
        // Excluimos órdenes eliminadas (deleted_at IS NOT NULL), sin odontólogo e históricas de julio (<= 360)
        $jobs = Job::whereNull('deleted_at')
            ->whereNotNull('dentist_id')
            ->where('total', '>', 0)
            ->where('id', '>', 360)
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('lab_account_moves as m')
                    ->where('m.reference_type', Job::class)
                    ->whereColumn('m.reference_id', 'jobs.id')
                    ->where('m.type', LabAccountMove::TYPE_CHARGE);
            })
            ->with(['dentist', 'phaseProgress'])
            ->orderBy('id')
            ->get();

        // Filtrar las que ya hubieran tenido movimientos por JobPhaseProgress que cubran el total
        $jobsToCharge = $jobs->filter(function (Job $job) {
            $phaseIds = $job->phaseProgress->pluck('id');
            if ($phaseIds->isEmpty()) {
                return true;
            }
            $billedPhaseTotal = (float) LabAccountMove::where('reference_type', JobPhaseProgress::class)
                ->whereIn('reference_id', $phaseIds)
                ->where('type', LabAccountMove::TYPE_CHARGE)
                ->sum('amount');

            return $billedPhaseTotal < (float) $job->total;
        });

        $this->line(sprintf('Se encontraron %d órdenes pendientes de regularizar.', $jobsToCharge->count()));

        $affectedAccountIds = [];

        DB::beginTransaction();

        try {
            foreach ($jobsToCharge as $job) {
                $account = LabAccount::firstOrCreate(
                    ['dentist_id' => $job->dentist_id],
                    ['balance' => 0]
                );

                $affectedAccountIds[$account->id] = true;

                $phaseIds = $job->phaseProgress->pluck('id');
                $alreadyBilled = $phaseIds->isNotEmpty()
                    ? (float) LabAccountMove::where('reference_type', JobPhaseProgress::class)
                        ->whereIn('reference_id', $phaseIds)
                        ->where('type', LabAccountMove::TYPE_CHARGE)
                        ->sum('amount')
                    : 0.0;

                $chargeAmount = round((float) $job->total - $alreadyBilled, 2);

                if ($chargeAmount <= 0) {
                    continue;
                }

                $moveDate = $job->created_at ? Carbon::parse($job->created_at)->toDateString() : Carbon::today()->toDateString();

                $this->line(sprintf(
                    '[%s] %s | Odontólogo: %s | Total: $%s | A cobrar: $%s | Fecha: %s',
                    $job->job_number,
                    $job->status,
                    $job->dentist?->name ?? 'N/A',
                    number_format($job->total, 2, ',', '.'),
                    number_format($chargeAmount, 2, ',', '.'),
                    $moveDate
                ));

                if (! $dryRun) {
                    $newMove = new LabAccountMove([
                        'lab_account_id' => $account->id,
                        'user_id' => $job->received_by_user_id ?? 1,
                        'type' => LabAccountMove::TYPE_CHARGE,
                        'amount' => $chargeAmount,
                        'balance_after' => 0,
                        'description' => 'Cargo por orden '.$job->job_number,
                        'reference_type' => Job::class,
                        'reference_id' => $job->id,
                        'move_date' => $moveDate,
                    ]);
                    $newMove->created_at = $job->created_at ?? now();
                    $newMove->save();
                }
            }

            if (! $dryRun) {
                foreach (array_keys($affectedAccountIds) as $accountId) {
                    $account = LabAccount::find($accountId);
                    if (! $account) {
                        continue;
                    }

                    $moves = LabAccountMove::where('lab_account_id', $account->id)
                        ->orderBy('move_date')
                        ->orderBy('id')
                        ->get();

                    $runningBalance = 0.0;
                    foreach ($moves as $move) {
                        $runningBalance += (float) $move->signed_amount;
                        $move->update(['balance_after' => $runningBalance]);
                    }

                    $account->update(['balance' => $runningBalance]);
                    $this->info(sprintf('Cuenta #%d (%s) recalculada: Saldo final = $%s',
                        $account->id,
                        $account->dentist?->name ?? 'N/A',
                        number_format($runningBalance, 2, ',', '.')
                    ));
                }

                DB::commit();
                $this->info('¡Regularización completada exitosamente!');
            } else {
                DB::rollBack();
                $this->info('Simulación finalizada. No se modificó la base de datos.');
            }

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Error durante la sincronización: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
