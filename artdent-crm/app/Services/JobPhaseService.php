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

            // Facturar primero: issuePhaseTicket() necesita el monto real ya
            // cobrado (que en la última fase es un ajuste contra el total
            // del arancel, no el precio crudo de la plantilla) para que el
            // ticket impreso coincida siempre con lo que se cobró.
            $this->billPhaseIfNeeded($phase);
            $this->issuePhaseTicket($phase);

            $job = $phase->job()->with('phaseProgress')->first();

            if ($this->allPhasesCompleted($job)) {
                $this->settleArancelRemainder($job);
                $this->finalizeJob($job);
            } else {
                $this->updateJobStatus($job, 'in_progress');
            }
        });
    }

    /**
     * Itemized summary of the job's phase tickets (Rodete, Enfilado,
     * Acrílico, etc.), with the grand total. Used to print a consolidated
     * "orden completa" ticket once the last phase finishes — Rodete +
     * Enfilado + Acrílico = precio del arancel, siempre y cuando el
     * arancel tenga sus fases reales configuradas con precio (cada línea
     * muestra exactamente lo que se facturó por esa fase, sin ajustes).
     *
     * También incluye cuánto de esta orden ya se pagó (`paid`) y cuánto
     * queda pendiente (`outstanding`) — si el odontólogo ya pagó, por
     * ejemplo, el Rodete, el ticket final tiene que reflejar ese pago en
     * vez de pedir el total bruto de nuevo.
     *
     * @return array{phases: array<int, array{description: string, quantity: float, unit_price: float, total: float}>, total: float, paid: float, outstanding: float}
     */
    public function buildJobTicketSummary(Job $job): array
    {
        $job->loadMissing(['job_items.tariff', 'dentist']);

        $items = [];
        foreach ($job->job_items as $item) {
            $items[] = [
                'description' => $item->tariff?->name ?? 'Trabajo',
                'quantity' => (float) ($item->quantity ?? 1),
                'unit_price' => (float) ($item->unit_price ?? $item->subtotal),
                'total' => (float) ($item->subtotal ?? $item->total),
            ];
        }

        if (empty($items)) {
            $items[] = [
                'description' => $this->tariffNameForJob($job),
                'quantity' => 1.0,
                'unit_price' => (float) $job->total,
                'total' => (float) $job->total,
            ];
        }

        $total = (float) $job->total;
        $paid = $this->paidAmountForJob($job);

        return [
            'phases' => $items,
            'total' => $total,
            'paid' => round($paid, 2),
            'outstanding' => round($total - $paid, 2),
        ];
    }

    /**
     * Cuánto de los cargos de esta orden ya se pagó, aplicando los pagos de
     * la cuenta corriente en el mismo orden cronológico/FIFO que
     * LabAccountController::buildOwedJobs() — así "Trabajos adeudados" y
     * este ticket siempre coinciden en qué está pagado y qué no.
     */
    private function paidAmountForJob(Job $job): float
    {
        if (! $job->dentist_id) {
            return 0.0;
        }

        $account = LabAccount::where('dentist_id', $job->dentist_id)->first();

        if (! $account) {
            return 0.0;
        }

        $moves = LabAccountMove::where('lab_account_id', $account->id)
            ->orderBy('move_date')
            ->orderBy('id')
            ->get();

        $phaseIds = $job->phaseProgress()->pluck('id');

        $remainingCredit = $moves->sum(fn (LabAccountMove $m) => max(0, (float) -$m->signed_amount));
        $paidForJob = 0.0;

        foreach ($moves->filter(fn (LabAccountMove $m) => (float) $m->signed_amount > 0) as $move) {
            $amount = (float) $move->amount;
            $paidAmount = min($remainingCredit, $amount);
            $remainingCredit = max(0, $remainingCredit - $paidAmount);

            $belongsToJob = ($move->reference_type === Job::class && (int) $move->reference_id === $job->id)
                || ($move->reference_type === JobPhaseProgress::class && $phaseIds->contains($move->reference_id));

            if ($belongsToJob) {
                $paidForJob += $paidAmount;
            }
        }

        return $paidForJob;
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
     * Factura cualquier fase pendiente de cobro y el remanente del arancel
     * para un trabajo con fases que se marca "entregado" (o cualquier
     * estado final) por fuera del Kiosk — ej. desde la edición general de
     * Job, donde el estado se puede fijar libremente sin pasar por
     * completePhase(). Reutiliza exactamente billPhaseIfNeeded() y
     * settleArancelRemainder(), así que nunca puede cobrar algo distinto
     * a como lo haría el Kiosk: cada fase su propio precio, el remanente
     * cierra contra job.total, todo idempotente si ya se facturó antes.
     */
    public function billOutstandingForManualDelivery(Job $job): void
    {
        $job->loadMissing('phaseProgress.tariffPhase');

        if ($job->phaseProgress->isEmpty()) {
            return;
        }

        foreach ($job->phaseProgress as $phase) {
            $this->billPhaseIfNeeded($phase);
        }

        $this->settleArancelRemainder($job);
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

    /**
     * Facturación manual desactivada: las cuentas corrientes se gestionan a nivel Job.
     * Mantenido como no-op para retrocompatibilidad.
     */
    public function billOutstandingForManualDelivery(Job $job): void
    {
        // No-op: los cargos se gestionan a nivel Job
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

        // El monto para el ticket de comisión del colaborador proviene del precio de la fase del arancel.
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
     * Facturación de fases a cuenta corriente desactivada:
     * Las cuentas corrientes se gestionan exclusivamente a nivel Job (1 orden = 1 cargo completo).
     * Las fases se preservan para control productivo del taller y tickets de comisión técnica.
     */
    private function billPhaseIfNeeded(JobPhaseProgress $phase): void
    {
        // No-op: los cobros a odontólogos se realizan exclusivamente a nivel Job
    }

    /**
     * Remanente desactivado:
     * El monto total de la orden ya se encuentra imputado en la cuenta corriente a nivel Job.
     */
    private function settleArancelRemainder(Job $job): void
    {
        // No-op: los cobros a odontólogos se realizan exclusivamente a nivel Job
    }

    /**
     * Nombre del arancel de la orden, para mostrar la línea del remanente
     * con el nombre real (ej. "ACRILICO INYECTADO O FLEX 1 A 3 DIENTES") en
     * vez de la palabra genérica "Arancel". Si la orden tiene más de un
     * ítem/arancel, usa el primero — el caso normal es un solo arancel por
     * orden.
     */
    private function tariffNameForJob(Job $job): string
    {
        $job->loadMissing('job_items.tariff');

        return $job->job_items->first()?->tariff?->name ?? 'Arancel';
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
