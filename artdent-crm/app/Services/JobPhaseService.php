<?php

namespace App\Services;

use App\Models\Job;
use App\Models\JobItem;
use App\Models\JobPhaseCollaborator;
use App\Models\JobPhaseProgress;
use App\Models\JobPhaseTicket;
use App\Models\JobStatusHistory;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class JobPhaseService
{
    public function __construct(private readonly JobCommissionService $commissionService) {}

    /**
     * Create pending JobPhaseProgress rows for each tariff phase on the job.
     * Safe to call multiple times — skips already-existing rows.
     */
    public function initializePhases(Job $job): void
    {
        $job->loadMissing('job_items.tariff.phases');

        $createdPhaseIds = $job->phaseProgress()->pluck('tariff_phase_id')->all();

        foreach ($job->job_items as $item) {
            if (! $item->tariff) {
                continue;
            }

            foreach ($item->tariff->phases()->orderBy('sort_order')->get() as $phase) {
                if (in_array($phase->id, $createdPhaseIds)) {
                    continue;
                }

                JobPhaseProgress::create([
                    'job_id' => $job->id,
                    'tariff_phase_id' => $phase->id,
                    'collaborator_id' => null,
                    'status' => JobPhaseProgress::STATUS_PENDING,
                ]);

                $createdPhaseIds[] = $phase->id;
            }
        }

        if ($job->status === 'received') {
            $this->updateJobStatus($job, 'in_progress');
        }
    }

    /**
     * Start a phase (no collaborator required yet — assigned at completion).
     */
    public function startPhase(JobPhaseProgress $phase): void
    {
        DB::transaction(function () use ($phase) {
            $phase->update([
                'status' => JobPhaseProgress::STATUS_IN_PROGRESS,
                'started_at' => now(),
            ]);

            $job = $phase->job;
            if ($job->status === 'received') {
                $this->updateJobStatus($job, 'in_progress');
            }
        });
    }

    /**
     * Mark the current in_progress phase as "en prueba" (sent to dentist for trial).
     * The work has left the lab at this point, so this is when the phase gets billed
     * to the dentist's cuenta corriente — not at completion (completePhase() won't bill
     * it again; see billPhaseIfNeeded()).
     */
    public function sendToProof(JobPhaseProgress $phase): void
    {
        DB::transaction(function () use ($phase) {
            $phase->update([
                'status' => JobPhaseProgress::STATUS_PRUEBA,
                'proof_sent_at' => now(),
            ]);

            $this->billPhaseIfNeeded($phase);
            $this->updateJobStatus($phase->job, 'quality_check');
        });
    }

    /**
     * Register that the dentist returned the work from proof. This does NOT complete
     * the phase — it puts it back "in progress" so the lab can resume/finish the actual
     * work. It only gets billed/ticketed later, when a technician explicitly completes
     * it via completePhase() and selects who worked on it.
     */
    public function returnFromProof(Job $job): void
    {
        $prueba = $job->phaseProgress()
            ->where('status', JobPhaseProgress::STATUS_PRUEBA)
            ->latest()
            ->first();

        if (! $prueba) {
            return;
        }

        DB::transaction(function () use ($prueba, $job) {
            $prueba->update([
                'status' => JobPhaseProgress::STATUS_IN_PROGRESS,
                'proof_returned_at' => now(),
            ]);

            $this->updateJobStatus($job, 'in_progress');
        });
    }

    /**
     * Mark a phase as completed, assign collaborators, generate ticket and billing move.
     * The billing move is skipped here if the phase was already billed when it was sent
     * to proof (see sendToProof()/billPhaseIfNeeded()), so debt is never duplicated.
     *
     * @param  array<int>  $collaboratorIds
     */
    public function completePhase(JobPhaseProgress $phase, array $collaboratorIds = []): void
    {
        DB::transaction(function () use ($phase, $collaboratorIds) {
            $phase->update([
                'status' => JobPhaseProgress::STATUS_COMPLETED,
                'completed_at' => now(),
                'collaborator_id' => $collaboratorIds[0] ?? null,
            ]);

            foreach ($collaboratorIds as $collaboratorId) {
                JobPhaseCollaborator::firstOrCreate([
                    'job_phase_progress_id' => $phase->id,
                    'collaborator_id' => $collaboratorId,
                ]);
            }

            $this->issuePhaseTicket($phase);
            $this->billPhaseIfNeeded($phase);

            $job = $phase->job()->with('phaseProgress')->first();

            if ($this->allPhasesCompleted($job)) {
                $this->finalizeJob($job);
            } else {
                $this->updateJobStatus($job, 'in_progress');
            }
        });
    }

    /**
     * Itemized summary of the job's billed items, with the grand total. Used
     * to print a consolidated "orden completa" ticket once the last phase
     * finishes.
     *
     * Ojo: NO son los JobPhaseTicket (esos son certificados de producción
     * internos por fase/técnico, usados para comisiones — su "amount" no es
     * el precio de venta, por eso el ticket salía con "Fase 1 x $0,00" en vez
     * del detalle facturado real). Esto tiene que reflejar job_items, lo
     * mismo que ve el cliente en la orden.
     *
     * @return array{phases: array<int, array{description: string, quantity: float, unit_price: float, total: float}>, total: float}
     */
    public function buildJobTicketSummary(Job $job): array
    {
        $job->loadMissing('job_items');

        $items = $job->job_items->map(fn (JobItem $item) => [
            'description' => $item->description,
            'quantity' => (float) $item->quantity,
            'unit_price' => (float) $item->unit_price,
            'total' => (float) $item->total,
        ])->all();

        return [
            'phases' => $items,
            'total' => (float) $job->total,
        ];
    }

    /**
     * Finalize the job: set status to "ready" and liquidar la comisión por trabajo
     * (usuario que dio de alta la orden + colaboradores que completaron fases).
     */
    public function finalizeJob(Job $job): void
    {
        $this->updateJobStatus($job, 'ready');
        $this->commissionService->processCommission($job);
    }

    /**
     * Register delivery and close the job.
     */
    public function registerDelivery(Job $job, string $deliveryMethod, ?string $notes = null): void
    {
        DB::transaction(function () use ($job, $deliveryMethod, $notes) {
            $job->update([
                'status' => 'delivered',
                'delivered_at' => now(),
                'delivery_method' => $deliveryMethod,
            ]);

            $this->recordJobStatusHistory($job, 'delivered', $notes);
        });
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function allPhasesCompleted(Job $job): bool
    {
        return $job->phaseProgress->isNotEmpty()
            && $job->phaseProgress->every(
                fn (JobPhaseProgress $p) => $p->status === JobPhaseProgress::STATUS_COMPLETED
            );
    }

    private function issuePhaseTicket(JobPhaseProgress $phase): JobPhaseTicket
    {
        $phase->loadMissing(['job', 'tariffPhase']);

        $job = $phase->job;
        $phaseName = $phase->tariffPhase?->name ?? 'Fase';
        $sortOrder = $phase->tariffPhase?->sort_order ?? 1;
        $amount = (float) ($phase->tariffPhase?->price ?? 0);

        $ticketNumber = sprintf('%s-F%d', $job->job_number, $sortOrder);

        $firstCollaboratorId = $phase->phaseCollaborators()->value('collaborator_id')
            ?? $phase->collaborator_id;

        return JobPhaseTicket::create([
            'job_id' => $job->id,
            'job_phase_progress_id' => $phase->id,
            'collaborator_id' => $firstCollaboratorId,
            'ticket_number' => $ticketNumber,
            'phase_name' => $phaseName,
            'amount' => $amount,
        ]);
    }

    /**
     * Bill a phase to the dentist's cuenta corriente exactly once — whichever transition
     * hits first (sendToProof or completePhase). Idempotent via `lab_account_move_id`:
     * a phase that was already billed when sent to proof is never billed again when it's
     * later completed, no matter how many proof/return cycles it goes through.
     *
     * If this is the last unbilled phase of the job (including the "no tariff phases
     * configured" fallback, which is always a single phase), the amount is reconciled
     * against the job's total instead of the phase's own tariff price, so rounding or
     * manual discounts on the job never leave a mismatched cuenta corriente.
     */
    private function billPhaseIfNeeded(JobPhaseProgress $phase): void
    {
        if ($phase->lab_account_move_id) {
            return;
        }

        $phase->loadMissing(['job', 'tariffPhase']);

        $job = $phase->job;

        if (! $job->dentist_id) {
            return;
        }

        $account = LabAccount::firstOrCreate(['dentist_id' => $job->dentist_id]);
        $userId = auth()->id() ?? 1;

        $unbilledSiblings = JobPhaseProgress::where('job_id', $job->id)
            ->where('id', '!=', $phase->id)
            ->whereNull('lab_account_move_id')
            ->count();

        if ($unbilledSiblings === 0) {
            $alreadyBilled = (float) LabAccountMove::where('reference_type', JobPhaseProgress::class)
                ->whereIn('reference_id', $job->phaseProgress()->pluck('id'))
                ->sum('amount');

            $amount = max(0, (float) $job->total - $alreadyBilled);
        } else {
            $amount = (float) ($phase->tariffPhase?->price ?? 0);
        }

        if ($amount <= 0) {
            return;
        }

        $move = LabAccountMove::create([
            'lab_account_id' => $account->id,
            'user_id' => $userId,
            'type' => LabAccountMove::TYPE_CHARGE,
            'amount' => $amount,
            'balance_after' => $account->balance + $amount,
            'description' => sprintf(
                'Orden %s — %s',
                $job->job_number,
                $phase->tariffPhase?->name ?? 'Fase'
            ),
            'reference_type' => JobPhaseProgress::class,
            'reference_id' => $phase->id,
            'move_date' => Carbon::today(),
        ]);

        $account->applyMove($move);

        $phase->update(['lab_account_move_id' => $move->id]);
    }

    private function updateJobStatus(Job $job, string $newStatus): void
    {
        if ($job->status === $newStatus) {
            return;
        }

        $job->update(['status' => $newStatus]);
        $this->recordJobStatusHistory($job, $newStatus);
    }

    private function recordJobStatusHistory(Job $job, string $status, ?string $note = null): void
    {
        JobStatusHistory::create([
            'job_id' => $job->id,
            'user_id' => auth()->id(),
            'status' => $status,
            'note' => $note,
        ]);
    }
}
