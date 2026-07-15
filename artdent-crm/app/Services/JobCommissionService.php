<?php

namespace App\Services;

use App\Models\CollaboratorExtra;
use App\Models\Employee;
use App\Models\EmployeeExtra;
use App\Models\Job;
use Illuminate\Support\Facades\DB;

/**
 * Liquida la comisión por trabajo (Job) de laboratorio a dos beneficiarios distintos:
 * el usuario que dio de alta la orden (vía su Employee.job_commission_pct) y los
 * colaboradores que efectivamente completaron alguna fase del trabajo (reparto igual
 * de Company.collaborator_commission_pct). Se calcula una sola vez por job, al
 * finalizarlo (todas las fases completadas), reutilizando el mecanismo de "extras"
 * ya existente para empleados y colaboradores en vez de una tabla nueva.
 */
class JobCommissionService
{
    public function __construct(
        private readonly EmployeePayrollService $employeePayrollService,
        private readonly CollaboratorReceiptSyncService $collaboratorReceiptSyncService,
    ) {}

    public function processCommission(Job $job): void
    {
        if ($job->commission_processed_at) {
            return;
        }

        DB::transaction(function () use ($job) {
            $this->payCreatorCommission($job);
            $this->payCollaboratorsCommission($job);

            $job->update(['commission_processed_at' => now()]);
        });
    }

    private function payCreatorCommission(Job $job): void
    {
        if (! $job->received_by_user_id) {
            return;
        }

        $employee = Employee::where('user_id', $job->received_by_user_id)->first();

        if (! $employee || $employee->job_commission_pct <= 0 || $job->total <= 0) {
            return;
        }

        $amount = round($job->total * $employee->job_commission_pct / 100, 2);

        if ($amount <= 0) {
            return;
        }

        EmployeeExtra::create([
            'company_id' => $job->company_id,
            'employee_id' => $employee->id,
            'date' => today(),
            'concept' => "Comisión trabajo {$job->job_number}",
            'amount' => $amount,
        ]);

        $this->employeePayrollService->syncDrafts($job->company_id, $employee->id);
    }

    private function payCollaboratorsCommission(Job $job): void
    {
        $pct = (float) ($job->company?->collaborator_commission_pct ?? 0);

        if ($pct <= 0 || $job->total <= 0) {
            return;
        }

        $job->loadMissing('phaseProgress.phaseCollaborators');

        $collaboratorIds = $job->phaseProgress
            ->flatMap(fn ($phase) => $phase->phaseCollaborators->pluck('collaborator_id'))
            ->filter()
            ->unique()
            ->values();

        if ($collaboratorIds->isEmpty()) {
            return;
        }

        $pool = round($job->total * $pct / 100, 2);
        $share = round($pool / $collaboratorIds->count(), 2);

        if ($share <= 0) {
            return;
        }

        $concept = "Comisión trabajo {$job->job_number} (reparto x{$collaboratorIds->count()})";

        foreach ($collaboratorIds as $collaboratorId) {
            CollaboratorExtra::create([
                'company_id' => $job->company_id,
                'collaborator_id' => $collaboratorId,
                'date' => today(),
                'concept' => $concept,
                'amount' => $share,
            ]);

            $this->collaboratorReceiptSyncService->syncDraftReceiptsForDate(
                $job->company_id,
                $collaboratorId,
                today()->toDateString(),
            );
        }
    }
}
