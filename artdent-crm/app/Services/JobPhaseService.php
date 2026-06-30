<?php

namespace App\Services;

use App\Models\Job;
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
     */
    public function sendToProof(JobPhaseProgress $phase): void
    {
        DB::transaction(function () use ($phase) {
            $phase->update([
                'status' => JobPhaseProgress::STATUS_PRUEBA,
                'proof_sent_at' => now(),
            ]);

            $this->updateJobStatus($phase->job, 'quality_check');
        });
    }

    /**
     * Register that the dentist returned the work from proof.
     * Completes the prueba phase and triggers billing + finalization/next-phase.
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

        $prueba->update(['proof_returned_at' => now()]);

        $existingCollabIds = $prueba->phaseCollaborators()->pluck('collaborator_id')->all();

        $this->completePhase($prueba, $existingCollabIds);
    }

    /**
     * Mark a phase as completed, assign collaborators, generate ticket and billing move.
     *
     * @param  array<int>  $collaboratorIds
     */
    public function completePhase(JobPhaseProgress $phase, array $collaboratorIds = []): void
    {
        DB::transaction(function () use ($phase, $collaboratorIds) {
            $phase->update([
                'status' => JobPhaseProgress::STATUS_COMPLETED,
                'completed_at' => now(),
            ]);

            foreach ($collaboratorIds as $collaboratorId) {
                JobPhaseCollaborator::firstOrCreate([
                    'job_phase_progress_id' => $phase->id,
                    'collaborator_id' => $collaboratorId,
                ]);
            }

            $this->issuePhaseTicket($phase);
            $this->createPhaseAccountMove($phase);

            $job = $phase->job()->with('phaseProgress')->first();

            if ($this->allPhasesCompleted($job)) {
                $this->finalizeJob($job);
            } else {
                $this->updateJobStatus($job, 'in_progress');
            }
        });
    }

    /**
     * Finalize the job: set status to "ready" and create the final billing move.
     */
    public function finalizeJob(Job $job): void
    {
        $this->updateJobStatus($job, 'ready');
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

    private function createPhaseAccountMove(JobPhaseProgress $phase): void
    {
        $phase->loadMissing(['job', 'tariffPhase']);

        $job = $phase->job;

        if (! $job->dentist_id) {
            return;
        }

        $account = LabAccount::firstOrCreate(['dentist_id' => $job->dentist_id]);
        $userId = auth()->id() ?? 1;

        $remainingCount = JobPhaseProgress::where('job_id', $job->id)
            ->where('status', '!=', JobPhaseProgress::STATUS_COMPLETED)
            ->count();

        if ($remainingCount === 0) {
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
