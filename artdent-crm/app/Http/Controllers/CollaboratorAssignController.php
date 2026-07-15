<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\Job;
use App\Models\JobPhaseProgress;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * CollaboratorAssignController
 * API para el panel de asignación de órdenes de trabajo a colaboradores presentes.
 * Todos los endpoints devuelven JSON.
 */
class CollaboratorAssignController extends Controller
{
    /**
     * Helper: obtiene el company_id del usuario autenticado (Sanctum token o sesión).
     */
    private function companyId(Request $request): int
    {
        return CompanyContext::id();
    }

    /**
     * GET /api/assign/jobs/unassigned
     * Órdenes disponibles: ninguna de sus fases está actualmente en progreso.
     */
    public function unassignedJobs(Request $request)
    {
        $jobs = Job::with(['dentist', 'patient', 'job_type', 'job_items', 'collaborators',
            'phaseProgress.tariffPhase', 'phaseProgress.phaseCollaborators.collaborator'])
            ->where('company_id', $this->companyId($request))
            ->whereIn('status', ['pending', 'received', 'in_progress', 'en_proceso', 'pendiente'])
            ->whereDoesntHave('phaseProgress', fn ($q) => $q->where('status', JobPhaseProgress::STATUS_IN_PROGRESS))
            ->orderBy('due_date')
            ->get()
            ->map(fn ($job) => $this->formatJob($job));

        return response()->json(['data' => $jobs]);
    }

    /**
     * GET /api/assign/jobs/assigned
     * Órdenes en proceso: al menos una fase tiene estado in_progress.
     */
    public function assignedJobs(Request $request)
    {
        $jobs = Job::with(['dentist', 'patient', 'job_type', 'job_items', 'collaborators',
            'phaseProgress.tariffPhase', 'phaseProgress.phaseCollaborators.collaborator'])
            ->where('company_id', $this->companyId($request))
            ->whereIn('status', ['pending', 'received', 'in_progress', 'en_proceso', 'pendiente'])
            ->whereHas('phaseProgress', fn ($q) => $q->where('status', JobPhaseProgress::STATUS_IN_PROGRESS))
            ->orderBy('due_date')
            ->get()
            ->map(fn ($job) => $this->formatJob($job));

        return response()->json(['data' => $jobs]);
    }

    /**
     * GET /api/assign/collaborators/present
     * Colaboradores activos que ingresaron hoy (time_in != null, time_out = null).
     */
    public function presentCollaborators(Request $request)
    {
        $today = Carbon::today();

        $presentIds = CollaboratorAttendance::where('company_id', $this->companyId($request))
            ->whereDate('work_date', $today)
            ->whereNotNull('time_in')
            ->whereNull('time_out')
            ->pluck('collaborator_id');

        $collaborators = Collaborator::where('company_id', $this->companyId($request))
            ->where('is_active', true)
            ->whereIn('id', $presentIds)
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'specialty' => $c->specialty,
                'initials' => $this->initials($c->name),
            ]);

        return response()->json(['data' => $collaborators]);
    }

    /**
     * POST /api/assign/jobs/{job}/assign
     * Asigna un colaborador a una orden de trabajo.
     * Body: { collaborator_id: int }
     */
    public function assign(Request $request, Job $job)
    {
        $request->validate([
            'collaborator_id' => 'required|integer|exists:collaborators,id',
        ]);

        // Evitar duplicado en pivot
        $already = $job->collaborators()
            ->where('collaborator_id', $request->collaborator_id)
            ->exists();

        if (! $already) {
            $job->collaborators()->attach($request->collaborator_id, [
                'assigned_by' => auth()->id(),
                'assigned_at' => now(),
            ]);
        }

        // Actualizar status a in_progress si estaba en pending/received
        if (in_array($job->status, ['pending', 'received', 'pendiente'])) {
            $job->update(['status' => 'in_progress']);
        }

        // Devolver el job actualizado
        $job->load(['dentist', 'patient', 'job_type', 'collaborators']);

        return response()->json([
            'message' => 'Colaborador asignado correctamente.',
            'data' => $this->formatJob($job),
        ]);
    }

    /**
     * POST /api/assign/jobs/{job}/unassign
     * Desasigna un colaborador de una orden.
     * Body: { collaborator_id: int }
     */
    public function unassign(Request $request, Job $job)
    {
        $request->validate([
            'collaborator_id' => 'required|integer|exists:collaborators,id',
        ]);

        $job->collaborators()->detach($request->collaborator_id);

        // Si quedó sin colaboradores vuelve a pending
        if ($job->collaborators()->count() === 0) {
            $job->update(['status' => 'pending']);
        }

        return response()->json(['message' => 'Colaborador removido.']);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ────────────────────────────────────────────────────────────────────────────

    private function formatJob(Job $job): array
    {
        $activePhases = $job->phaseProgress
            ->filter(fn ($p) => $p->status === JobPhaseProgress::STATUS_IN_PROGRESS)
            ->map(fn ($p) => [
                'id' => $p->id,
                'phase_name' => $p->tariffPhase?->name ?? 'Fase',
                'started_at' => $p->started_at?->toDateTimeString(),
                'collaborators' => $p->phaseCollaborators->map(fn ($pc) => [
                    'id' => $pc->collaborator?->id,
                    'name' => $pc->collaborator?->name ?? '—',
                    'initials' => $this->initials($pc->collaborator?->name ?? '?'),
                ])->values(),
            ])->values();

        return [
            'id' => $job->id,
            'job_number' => $job->job_number,
            'status' => $job->status,
            'priority' => $job->priority,
            'shade' => $job->shade,
            'due_date' => $job->due_date?->toDateString(),
            'received_at' => $job->received_at?->toDateString(),
            'dentist' => $job->dentist ? [
                'id' => $job->dentist->id,
                'name' => $job->dentist->name,
            ] : null,
            'patient' => $job->patient ? [
                'id' => $job->patient->id,
                'name' => $job->patient->name,
            ] : null,
            'job_type' => $job->job_type ? [
                'id' => $job->job_type->id,
                'name' => $job->job_type->name,
            ] : null,
            'description' => $job->job_type
                ? $job->description
                : ($job->job_items->first()?->description ?? $job->description),
            'collaborators' => $job->collaborators->map(fn ($c) => [
                'id' => $c->id,
                'name' => $c->name,
                'specialty' => $c->specialty,
                'initials' => $this->initials($c->name),
            ])->values(),
            'active_phases' => $activePhases,
        ];
    }

    private function initials(string $name): string
    {
        $parts = array_filter(explode(' ', trim($name)));
        if (count($parts) >= 2) {
            return strtoupper(mb_substr($parts[0], 0, 1).mb_substr($parts[1], 0, 1));
        }

        return strtoupper(mb_substr($name, 0, 2));
    }
}
