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
        $tickets = JobPhaseTicket::where('job_id', $job->id)
            ->with('phaseProgress.tariffPhase')
            ->get()
            ->sortBy(fn (JobPhaseTicket $t) => $t->phaseProgress?->tariffPhase?->sort_order ?? 0)
            ->values();

        $items = $tickets->map(fn (JobPhaseTicket $t) => [
            'description' => $t->phase_name,
            'quantity' => 1.0,
            'unit_price' => (float) $t->amount,
            'total' => (float) $t->amount,
        ])->all();

        $remainderMove = LabAccountMove::where('reference_type', Job::class)
            ->where('reference_id', $job->id)
            ->first();

        if ($remainderMove) {
            $items[] = [
                'description' => $this->tariffNameForJob($job),
                'quantity' => 1.0,
                'unit_price' => (float) $remainderMove->amount,
                'total' => (float) $remainderMove->amount,
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
        $phase->loadMissing(['job', 'tariffPhase', 'labAccountMove']);

        $job = $phase->job;
        $phaseName = $phase->tariffPhase?->name ?? 'Fase';
        $sortOrder = $phase->tariffPhase?->sort_order ?? 1;

        // El monto es el precio real de la plantilla de fase (billPhaseIfNeeded,
        // llamado antes que esto, cobra exactamente ese valor) — si la fase
        // no llegó a facturar (precio $0), cae al precio de plantilla igual.
        $amount = (float) ($phase->labAccountMove?->amount ?? $phase->tariffPhase?->price ?? 0);

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

        // Una orden "received" (Pendiente) nunca debe generar deuda, ni
        // siquiera si alguna fase quedó marcada completada mientras el
        // estado no avanzó (ver initializePhasesForJob() en JobController,
        // que hasta hace poco no sacaba la orden de "received" al crear las
        // fases). Freno explícito acá además del fix en el origen, para no
        // depender de que todos los caminos que crean/avanzan fases
        // recuerden actualizar el estado correctamente.
        if ($job->status === 'received') {
            return;
        }

        if (! $job->dentist_id) {
            return;
        }

        $account = LabAccount::firstOrCreate(['dentist_id' => $job->dentist_id]);
        $userId = auth()->id() ?? 1;

        // Cada fase cobra exactamente su precio configurado en la plantilla
        // — nunca un ajuste contra el total del arancel, ni siquiera siendo
        // la última fase configurada. Si una fase (ej. Encerado) vale $0 en
        // el catálogo, no genera cargo. Para que la suma cierre contra
        // job.total, el arancel tiene que tener todas sus fases reales
        // configuradas con precio (incluida la del producto terminado) — es
        // responsabilidad de quien arma el arancel, no algo que el sistema
        // deba inferir.
        $amount = (float) ($phase->tariffPhase?->price ?? 0);

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

    /**
     * Cuando la última fase de la orden se completa de verdad (no solo se
     * manda a prueba), factura el resto del arancel que las fases
     * individuales no cubrieron — así fase1 + fase2 + ... + remanente
     * siempre cierra exactamente contra job.total, sin importar cómo estén
     * configuradas las fases. Cargo adicional a la cuenta corriente (no una
     * fase más), idempotente vía el propio LabAccountMove de referencia.
     */
    private function settleArancelRemainder(Job $job): void
    {
        if (! $job->dentist_id) {
            return;
        }

        if ($job->status === 'received') {
            return;
        }

        $alreadySettled = LabAccountMove::where('reference_type', Job::class)
            ->where('reference_id', $job->id)
            ->exists();

        if ($alreadySettled) {
            return;
        }

        $billedForPhases = (float) LabAccountMove::where('reference_type', JobPhaseProgress::class)
            ->whereIn('reference_id', $job->phaseProgress()->pluck('id'))
            ->sum('amount');

        $remainder = round((float) $job->total - $billedForPhases, 2);

        if ($remainder <= 0) {
            return;
        }

        $account = LabAccount::firstOrCreate(['dentist_id' => $job->dentist_id]);
        $userId = auth()->id() ?? 1;

        $move = LabAccountMove::create([
            'lab_account_id' => $account->id,
            'user_id' => $userId,
            'type' => LabAccountMove::TYPE_CHARGE,
            'amount' => $remainder,
            'balance_after' => $account->balance + $remainder,
            'description' => sprintf('Orden %s — %s', $job->job_number, $this->tariffNameForJob($job)),
            'reference_type' => Job::class,
            'reference_id' => $job->id,
            'move_date' => Carbon::today(),
        ]);

        $account->applyMove($move);
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
