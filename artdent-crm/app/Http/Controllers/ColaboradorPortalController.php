<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\Job;
use App\Models\JobPhaseProgress;
use App\Models\JobPhaseTicket;
use App\Models\JobStatusHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class ColaboradorPortalController extends Controller
{
    public function showLogin(): Response
    {
        $collaborators = Collaborator::where('is_active', true)
            ->whereNotNull('pin')
            ->orderBy('name')
            ->get(['id', 'name', 'specialty']);

        return Inertia::render('Colaboradores/Login', [
            'collaborators' => $collaborators,
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $request->validate([
            'collaborator_id' => ['required', 'integer'],
            'pin' => ['required', 'string'],
        ]);

        $collaborator = Collaborator::where('id', $request->collaborator_id)
            ->where('is_active', true)
            ->first();

        if (! $collaborator || ! Hash::check($request->pin, $collaborator->pin)) {
            return back()->withErrors(['pin' => 'PIN incorrecto.']);
        }

        $request->session()->put('colaborador_id', $collaborator->id);
        $request->session()->put('colaborador_name', $collaborator->name);

        return redirect()->route('colaboradores.dashboard');
    }

    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget(['colaborador_id', 'colaborador_name']);

        return redirect()->route('colaboradores.login');
    }

    public function dashboard(Request $request): Response
    {
        $colaboradorId = $request->session()->get('colaborador_id');
        $colaborador = Collaborator::findOrFail($colaboradorId);
        $companyId = $colaborador->company_id;

        // Fases disponibles para tomar: sin colaborador asignado, pendientes, y
        // donde la fase anterior (si existe) esté completada
        $availablePhases = JobPhaseProgress::with(['job.dentist', 'tariffPhase'])
            ->whereNull('collaborator_id')
            ->where('status', JobPhaseProgress::STATUS_PENDING)
            ->whereHas('job', fn ($q) => $q->where('company_id', $companyId)
                ->whereIn('status', ['received', 'in_progress', 'quality_check']))
            ->get()
            ->filter(function (JobPhaseProgress $phase) {
                // Solo mostrar si no hay fase anterior incompleta
                return ! JobPhaseProgress::where('job_id', $phase->job_id)
                    ->where('id', '<', $phase->id)
                    ->whereIn('status', [JobPhaseProgress::STATUS_PENDING, JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])
                    ->exists();
            })
            ->values()
            ->map(fn (JobPhaseProgress $p) => [
                'id' => $p->id,
                'job_id' => $p->job_id,
                'job_number' => $p->job->job_number,
                'priority' => $p->job->priority,
                'due_date' => $p->job->due_date?->toDateString(),
                'dentist' => $p->job->dentist ? ['name' => $p->job->dentist->name] : null,
                'phase_name' => $p->tariffPhase->name,
                'price' => $p->tariffPhase->price,
            ]);

        // Trabajos sin fases configuradas que siguen disponibles para reclamar
        $pendingJobs = Job::with(['dentist', 'job_items.tariff'])
            ->where('company_id', $companyId)
            ->where('status', 'received')
            ->whereDoesntHave('phaseProgress')
            ->whereDoesntHave('collaborators')
            ->orderBy('priority', 'desc')
            ->orderBy('due_date')
            ->get()
            ->map(fn (Job $j) => $this->formatJobForPortal($j));

        // Mis fases activas (in_progress o prueba asignadas a este colaborador)
        $myPhases = JobPhaseProgress::with(['job.dentist', 'tariffPhase', 'ticket'])
            ->where('collaborator_id', $colaboradorId)
            ->whereIn('status', [JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])
            ->get()
            ->map(fn (JobPhaseProgress $p) => [
                'id' => $p->id,
                'job_id' => $p->job_id,
                'job_number' => $p->job->job_number,
                'priority' => $p->job->priority,
                'due_date' => $p->job->due_date?->toDateString(),
                'dentist' => $p->job->dentist ? ['name' => $p->job->dentist->name] : null,
                'phase_name' => $p->tariffPhase->name,
                'price' => $p->tariffPhase->price,
                'status' => $p->status,
            ]);

        return Inertia::render('Colaboradores/Dashboard', [
            'colaborador' => ['id' => $colaborador->id, 'name' => $colaborador->name, 'specialty' => $colaborador->specialty],
            'availablePhases' => $availablePhases,
            'pendingJobs' => $pendingJobs,
            'myPhases' => $myPhases,
        ]);
    }

    // Reclamar trabajo completo — solo para trabajos SIN fases configuradas
    public function claim(Request $request, Job $job): RedirectResponse
    {
        $colaboradorId = $request->session()->get('colaborador_id');
        $colaborador = Collaborator::findOrFail($colaboradorId);

        if ($job->status !== 'received') {
            return back()->withErrors(['job' => 'Este trabajo ya fue reclamado o no está disponible.']);
        }

        $job->collaborators()->syncWithoutDetaching([
            $colaboradorId => [
                'assigned_by' => null,
                'role' => $colaborador->specialty ?? 'técnico',
                'assigned_at' => now(),
                'completed_at' => null,
            ],
        ]);

        $job->update(['status' => 'in_progress', 'assigned_user_id' => $colaboradorId]);

        JobStatusHistory::create([
            'job_id' => $job->id,
            'user_id' => null,
            'status' => 'in_progress',
            'note' => "Reclamado por colaborador: {$colaborador->name}",
        ]);

        return redirect()->route('colaboradores.jobs.show', $job->id);
    }

    // Tomar una fase individual (nuevo flujo: cada técnico reclama su propia fase)
    public function claimPhase(Request $request, JobPhaseProgress $phase): RedirectResponse
    {
        $colaboradorId = $request->session()->get('colaborador_id');
        $colaborador = Collaborator::findOrFail($colaboradorId);

        if ($phase->collaborator_id !== null || $phase->status !== JobPhaseProgress::STATUS_PENDING) {
            return back()->withErrors(['phase' => 'Esta fase ya fue tomada o no está disponible.']);
        }

        // Verificar que sea la primera fase pendiente del trabajo (orden secuencial)
        $previousPending = JobPhaseProgress::where('job_id', $phase->job_id)
            ->where('id', '<', $phase->id)
            ->whereIn('status', [JobPhaseProgress::STATUS_PENDING, JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])
            ->exists();

        if ($previousPending) {
            return back()->withErrors(['phase' => 'Hay fases anteriores que aún no están completadas.']);
        }

        $phase->update([
            'collaborator_id' => $colaboradorId,
            'status' => JobPhaseProgress::STATUS_IN_PROGRESS,
            'started_at' => now(),
        ]);

        $job = $phase->job;

        // Agregar colaborador al pivot del trabajo si no está ya
        $job->collaborators()->syncWithoutDetaching([
            $colaboradorId => [
                'assigned_by' => null,
                'role' => $colaborador->specialty ?? 'técnico',
                'assigned_at' => now(),
                'completed_at' => null,
            ],
        ]);

        if ($job->status === 'received') {
            $job->update(['status' => 'in_progress', 'assigned_user_id' => $colaboradorId]);
        }

        JobStatusHistory::create([
            'job_id' => $job->id,
            'user_id' => null,
            'status' => $job->status,
            'note' => "Fase '{$phase->tariffPhase->name}' tomada por: {$colaborador->name}",
        ]);

        return redirect()->route('colaboradores.jobs.show', $job->id);
    }

    public function showJob(Request $request, Job $job): Response
    {
        $colaboradorId = $request->session()->get('colaborador_id');

        $job->load([
            'dentist',
            'patient',
            'job_items.tariff.phases',
            'phaseProgress.tariffPhase',
            'phaseProgress.collaborator',
            'phaseProgress.ticket',
        ]);

        $phases = $job->phaseProgress->map(fn (JobPhaseProgress $p) => [
            'id' => $p->id,
            'phase_name' => $p->tariffPhase->name,
            'price' => $p->tariffPhase->price,
            'status' => $p->status,
            'collaborator_id' => $p->collaborator_id,
            'collaborator_name' => $p->collaborator?->name,
            'is_mine' => $p->collaborator_id === $colaboradorId,
            'is_claimable' => $p->collaborator_id === null
                && $p->status === JobPhaseProgress::STATUS_PENDING
                && ! $job->phaseProgress
                    ->where('id', '<', $p->id)
                    ->whereIn('status', [JobPhaseProgress::STATUS_PENDING, JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])
                    ->count(),
            'started_at' => $p->started_at?->toDateTimeString(),
            'completed_at' => $p->completed_at?->toDateTimeString(),
            'ticket' => $p->ticket ? [
                'id' => $p->ticket->id,
                'ticket_number' => $p->ticket->ticket_number,
                'amount' => $p->ticket->amount,
            ] : null,
        ]);

        return Inertia::render('Colaboradores/JobDetail', [
            'colaborador' => ['id' => $colaboradorId, 'name' => $request->session()->get('colaborador_name')],
            'job' => [
                'id' => $job->id,
                'job_number' => $job->job_number,
                'status' => $job->status,
                'priority' => $job->priority,
                'description' => $job->description,
                'shade' => $job->shade,
                'due_date' => $job->due_date?->toDateString(),
                'dentist' => $job->dentist ? ['name' => $job->dentist->name] : null,
                'patient' => $job->patient ? ['name' => $job->patient->name.' '.($job->patient->last_name ?? '')] : null,
                'total' => $job->total,
                'phases' => $phases,
                'has_phases' => $phases->isNotEmpty(),
            ],
        ]);
    }

    public function sendToPrueba(Request $request, Job $job, JobPhaseProgress $phase): RedirectResponse
    {
        $colaboradorId = $request->session()->get('colaborador_id');

        if ($phase->job_id !== $job->id
            || $phase->collaborator_id !== $colaboradorId
            || $phase->status !== JobPhaseProgress::STATUS_IN_PROGRESS) {
            return back()->withErrors(['phase' => 'Fase no válida para enviar a prueba.']);
        }

        $phase->update(['status' => JobPhaseProgress::STATUS_PRUEBA]);
        $job->update(['status' => 'quality_check']);

        JobStatusHistory::create([
            'job_id' => $job->id,
            'user_id' => null,
            'status' => 'quality_check',
            'note' => "Fase '{$phase->tariffPhase->name}' enviada a PRUEBA",
        ]);

        return back();
    }

    public function completePhase(Request $request, Job $job, JobPhaseProgress $phase): RedirectResponse
    {
        $colaboradorId = $request->session()->get('colaborador_id');

        if ($phase->job_id !== $job->id
            || $phase->collaborator_id !== $colaboradorId
            || ! in_array($phase->status, [JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])) {
            return back()->withErrors(['phase' => 'Fase no válida para completar.']);
        }

        $colaborador = Collaborator::findOrFail($colaboradorId);
        $tariffPhase = $phase->tariffPhase;

        $phase->update([
            'status' => JobPhaseProgress::STATUS_COMPLETED,
            'completed_at' => now(),
        ]);

        // Generar ticket de fase (solo tracking interno, no genera cargo en cuenta)
        JobPhaseTicket::create([
            'job_id' => $job->id,
            'job_phase_progress_id' => $phase->id,
            'collaborator_id' => $colaboradorId,
            'ticket_number' => $this->generateTicketNumber($job),
            'phase_name' => $tariffPhase->name,
            'amount' => $tariffPhase->price,
        ]);

        // Verificar si quedan fases pendientes o en progreso
        $hasPendingPhases = JobPhaseProgress::where('job_id', $job->id)
            ->whereIn('status', [JobPhaseProgress::STATUS_PENDING, JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA])
            ->exists();

        if (! $hasPendingPhases) {
            $job->update(['status' => 'ready']);
            JobStatusHistory::create([
                'job_id' => $job->id,
                'user_id' => null,
                'status' => 'ready',
                'note' => "Todas las fases completadas. Última por: {$colaborador->name}",
            ]);
        } else {
            $job->update(['status' => 'in_progress']);
        }

        return redirect()->route('colaboradores.jobs.show', $job->id);
    }

    public function showTicket(Request $request, Job $job, JobPhaseProgress $phase): Response
    {
        $phase->load(['tariffPhase', 'collaborator', 'ticket']);

        $job->load(['dentist', 'job_items.tariff']);

        return Inertia::render('Colaboradores/PhaseTicket', [
            'job' => [
                'job_number' => $job->job_number,
                'description' => $job->description,
                'dentist' => $job->dentist ? ['name' => $job->dentist->name] : null,
            ],
            'phase' => [
                'name' => $phase->tariffPhase->name,
                'price' => $phase->tariffPhase->price,
            ],
            'ticket' => $phase->ticket ? [
                'ticket_number' => $phase->ticket->ticket_number,
                'amount' => $phase->ticket->amount,
                'printed_at' => $phase->ticket->printed_at?->toDateTimeString(),
                'created_at' => $phase->ticket->created_at->toDateTimeString(),
            ] : null,
            'collaborator' => ['name' => $phase->collaborator->name],
        ]);
    }

    private function formatJobForPortal(Job $job): array
    {
        $primaryTariff = $job->job_items->first()?->tariff?->name ?? $job->description ?? '—';

        return [
            'id' => $job->id,
            'job_number' => $job->job_number,
            'status' => $job->status,
            'priority' => $job->priority,
            'description' => $job->description ?? $primaryTariff,
            'tariff' => $primaryTariff,
            'due_date' => $job->due_date?->toDateString(),
            'dentist' => $job->dentist ? ['name' => $job->dentist->name] : null,
            'total' => $job->total,
        ];
    }

    private function generateTicketNumber(Job $job): string
    {
        $count = JobPhaseTicket::where('job_id', $job->id)->count() + 1;

        return strtoupper($job->job_number).'-F'.str_pad($count, 2, '0', STR_PAD_LEFT);
    }
}
