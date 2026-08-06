<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\Company;
use App\Models\Job;
use App\Models\JobPhaseProgress;
use App\Services\JobPhaseService;
use App\Support\CrmMode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class JobPhaseKioskController extends Controller
{
    public function __construct(private readonly JobPhaseService $phaseService) {}

    /**
     * The job-phase kiosk page (no auth — uses company slug from URL).
     */
    public function index(): InertiaResponse
    {
        $companyId = Auth::user()?->company_id ?? $this->resolveCompanyId();

        $collaborators = Collaborator::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'specialty']);

        $company = Company::find($companyId, ['id', 'name', 'fantasy_name', 'logo_url', 'lab_logo_url', 'address', 'city', 'province', 'phone', 'email']);

        return Inertia::render('JobKiosk/Index', [
            'collaborators' => $collaborators,
            'company' => $company,
            'tenant_id' => (string) (CrmMode::tenantInfo()['id'] ?? 'owner'),
        ]);
    }

    /**
     * List jobs available to work on:
     * - ALL received jobs (phases may not be initialized yet)
     * - In-progress / quality_check jobs that still have pending phases
     */
    public function availableJobs(): JsonResponse
    {
        $companyId = Auth::user()?->company_id ?? $this->resolveCompanyId();

        $jobs = Job::where('company_id', $companyId)
            ->where(function ($q) {
                $q->where('status', 'received')
                    ->orWhere(function ($inner) {
                        $inner->whereIn('status', ['in_progress', 'quality_check'])
                            ->whereHas('phaseProgress', fn ($sub) => $sub->where('status', JobPhaseProgress::STATUS_PENDING));
                    });
            })
            ->whereDoesntHave('phaseProgress', fn ($q) => $q->whereIn('status', [
                JobPhaseProgress::STATUS_IN_PROGRESS,
                JobPhaseProgress::STATUS_PRUEBA,
            ]))
            ->with([
                'dentist:id,name',
                'patient:id,name,name',
                'phaseProgress' => fn ($q) => $q->with('tariffPhase'),
                'job_items:id,job_id,description',
            ])
            ->orderBy('due_date')
            ->get(['id', 'job_number', 'status', 'due_date', 'priority', 'dentist_id', 'patient_id', 'description']);

        return response()->json($jobs);
    }

    /**
     * List all phases currently in progress (anyone can complete them).
     */
    public function inProgressPhases(): JsonResponse
    {
        $companyId = Auth::user()?->company_id ?? $this->resolveCompanyId();

        $phases = JobPhaseProgress::whereIn('status', [
            JobPhaseProgress::STATUS_IN_PROGRESS,
            JobPhaseProgress::STATUS_PRUEBA,
        ])
            ->whereHas('job', fn ($q) => $q
                ->where('company_id', $companyId)
                ->whereNotIn('status', ['delivered', 'ready', 'cancelled'])
            )
            ->with([
                'tariffPhase',
                'job:id,job_number,status,due_date,priority,dentist_id,patient_id,description',
                'job.dentist:id,name',
                'job.patient:id,name,name',
                'job.job_items:id,job_id,description',
            ])
            ->get();

        return response()->json($phases);
    }

    /**
     * Start a phase. Accepts either an existing pending phase_progress ID or a job_id.
     * When a job_id is given, phases are auto-initialized from the tariff first,
     * then the first pending phase is started.
     */
    public function takePhase(Request $request): JsonResponse
    {
        $data = $request->validate([
            'job_phase_progress_id' => ['nullable', 'integer', 'exists:job_phase_progress,id'],
            'job_id' => ['nullable', 'integer', 'exists:jobs,id'],
        ]);

        if (! empty($data['job_phase_progress_id'])) {
            $phase = JobPhaseProgress::findOrFail($data['job_phase_progress_id']);

            if ($phase->status !== JobPhaseProgress::STATUS_PENDING) {
                return response()->json(['error' => 'Esta fase ya no está disponible.'], 422);
            }
        } elseif (! empty($data['job_id'])) {
            $job = Job::with('job_items.tariff.phases')->findOrFail($data['job_id']);

            $this->phaseService->initializePhases($job);

            $phase = $job->phaseProgress()->where('status', JobPhaseProgress::STATUS_PENDING)->first();

            // No tariff phases configured — create a single generic "Producción" phase.
            if (! $phase) {
                $phase = JobPhaseProgress::create([
                    'job_id' => $job->id,
                    'tariff_phase_id' => null,
                    'collaborator_id' => null,
                    'status' => JobPhaseProgress::STATUS_PENDING,
                ]);
            }
        } else {
            return response()->json(['error' => 'Debe indicar job_id o job_phase_progress_id.'], 422);
        }

        $this->phaseService->startPhase($phase);

        return response()->json(['success' => true, 'phase_id' => $phase->id]);
    }

    /**
     * Mark a phase as completed — collaborator(s) selected at this moment.
     */
    public function completePhase(Request $request): JsonResponse
    {
        $data = $request->validate([
            'job_phase_progress_id' => ['required', 'integer', 'exists:job_phase_progress,id'],
            'collaborator_ids' => ['required', 'array', 'min:1'],
            'collaborator_ids.*' => ['integer', 'exists:collaborators,id'],
        ]);

        $phase = JobPhaseProgress::with(['job', 'tariffPhase', 'phaseCollaborators'])->findOrFail($data['job_phase_progress_id']);

        if (! in_array($phase->status, [JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])) {
            return response()->json(['error' => 'La fase no está en progreso.'], 422);
        }

        $this->phaseService->completePhase($phase, $data['collaborator_ids']);

        $fresh = $phase->fresh()->load(['job.dentist', 'job.patient', 'job.company', 'ticket']);
        $ticket = $fresh->ticket;
        $job = $fresh->job;
        $jobComplete = $job->status === 'ready';

        return response()->json([
            'success' => true,
            'ticket_number' => $ticket?->ticket_number,
            'phase_name' => $ticket?->phase_name,
            'amount' => $ticket?->amount,
            'job_number' => $job?->job_number,
            'received_at' => $job?->received_at,
            'shade' => $job?->shade,
            'dentist_name' => $job?->dentist?->name,
            'patient_name' => $job?->patient?->name,
            'company' => $job?->company ? [
                'name' => $job->company->name,
                'logo_url' => $job->company->logo_url,
                'lab_logo_url' => $job->company->lab_logo_url,
                'address' => $job->company->address,
                'city' => $job->company->city,
                'province' => $job->company->province,
            ] : null,
            'job_complete' => $jobComplete,
            'final_ticket' => $jobComplete ? $this->phaseService->buildJobTicketSummary($job) : null,
        ]);
    }

    /**
     * Mark an in_progress phase as "en prueba" (sent to dentist for trial fitting).
     */
    public function sendToProof(Request $request): JsonResponse
    {
        $data = $request->validate([
            'job_phase_progress_id' => ['required', 'integer', 'exists:job_phase_progress,id'],
        ]);

        $phase = JobPhaseProgress::with(['job.dentist', 'job.patient', 'job.company', 'tariffPhase'])
            ->findOrFail($data['job_phase_progress_id']);

        if ($phase->status !== JobPhaseProgress::STATUS_IN_PROGRESS) {
            return response()->json(['error' => 'La fase debe estar en progreso para enviar a prueba.'], 422);
        }

        $this->phaseService->sendToProof($phase);

        // sendToProof() ya factura la fase acá adentro (billPhaseIfNeeded),
        // con el precio de la plantilla de fase — o el ajuste contra el
        // total si es la última. El ticket tiene que reflejar ese monto
        // real, no $0.
        $phase->refresh()->load('labAccountMove');
        $job = $phase->job;

        return response()->json([
            'success' => true,
            'sent_to_proof' => true,
            'ticket_number' => $job ? sprintf('%s-F%d', $job->job_number, $phase->tariffPhase?->sort_order ?? 1) : null,
            'phase_name' => $phase->tariffPhase?->name ?? 'Fase',
            'amount' => (float) ($phase->labAccountMove?->amount ?? 0),
            'job_number' => $job?->job_number,
            'received_at' => $job?->received_at,
            'shade' => $job?->shade,
            'dentist_name' => $job?->dentist?->name,
            'patient_name' => $job?->patient?->name,
            'company' => $job?->company ? [
                'name' => $job->company->name,
                'logo_url' => $job->company->logo_url,
                'lab_logo_url' => $job->company->lab_logo_url,
                'address' => $job->company->address,
                'city' => $job->company->city,
                'province' => $job->company->province,
            ] : null,
        ]);
    }

    /**
     * CRM-side: register the dentist returned the work from proof.
     */
    public function returnFromProof(Job $job): JsonResponse
    {
        if ($job->status !== 'quality_check') {
            return response()->json(['error' => 'El trabajo no está en estado de prueba.'], 422);
        }

        $this->phaseService->returnFromProof($job);

        return response()->json(['success' => true]);
    }

    /**
     * Register delivery and close the job.
     */
    public function registerDelivery(Request $request, Job $job): JsonResponse
    {
        $data = $request->validate([
            'delivery_method' => ['required', 'string', 'in:retiro_dentista,reparto,courier,retiro_paciente'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        if ($job->status !== 'ready') {
            return response()->json(['error' => 'El trabajo debe estar terminado para registrar la entrega.'], 422);
        }

        $this->phaseService->registerDelivery($job, $data['delivery_method'], $data['notes'] ?? null);

        return response()->json(['success' => true]);
    }

    /**
     * Initialize phases for a job that has no phase progress yet.
     * Called from CRM when transitioning a job from received → in_progress.
     */
    public function initializePhases(Job $job): JsonResponse
    {
        $this->phaseService->initializePhases($job);

        return response()->json(['success' => true, 'phases' => $job->fresh()->phaseProgress()->with('tariffPhase')->get()]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function resolveCompanyId(): int
    {
        return (int) config('tenancy.company_id', 1);
    }
}
