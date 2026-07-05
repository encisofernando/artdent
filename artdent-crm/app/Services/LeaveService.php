<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Carbon\Carbon;

class LeaveService
{
    /**
     * Días de vacaciones que corresponden al empleado para un año calendario dado, según la
     * antigüedad computada al 31/12 de ese año (LCT art. 150):
     *   hasta 5 años -> 14 días corridos
     *   más de 5 y hasta 10 -> 21 días
     *   más de 10 y hasta 20 -> 28 días
     *   más de 20 -> 35 días
     * Si el ingreso ocurrió durante ese año (no llega a trabajar el año calendario completo),
     * se prorratea 1 día de descanso por cada 20 días de trabajo efectivo (LCT art. 153).
     */
    public function vacationEntitlementDays(Employee $employee, int $year): float
    {
        if (! $employee->hire_date) {
            return 0.0;
        }

        $yearStart = Carbon::create($year, 1, 1);
        $yearEnd = Carbon::create($year, 12, 31);

        if ($employee->hire_date->greaterThan($yearEnd)) {
            return 0.0;
        }

        if ($employee->hire_date->lessThanOrEqualTo($yearStart)) {
            $antiguedadAnios = (int) $employee->hire_date->diffInYears($yearEnd);

            return (float) match (true) {
                $antiguedadAnios > 20 => 35,
                $antiguedadAnios > 10 => 28,
                $antiguedadAnios > 5 => 21,
                default => 14,
            };
        }

        $daysWorkedThisYear = $employee->hire_date->diffInDays($yearEnd) + 1;

        return round($daysWorkedThisYear / 20, 2);
    }

    /**
     * Obtiene (o crea) el saldo de un empleado para un tipo de licencia y año. Para vacaciones,
     * `accrued_days` se calcula por antigüedad; para el resto, se usa el tope del tipo de
     * licencia (`max_days_per_year`), 0 si no tiene tope definido (licencia sin límite formal
     * en el sistema, ej. enfermedad — la duración exacta de la licencia paga por enfermedad
     * depende de antigüedad y cargas de familia, LCT arts. 208-211, no modelada aquí).
     */
    public function ensureBalance(Employee $employee, LeaveType $leaveType, int $year): LeaveBalance
    {
        return LeaveBalance::firstOrCreate(
            ['employee_id' => $employee->id, 'leave_type_id' => $leaveType->id, 'year' => $year],
            [
                'company_id' => $employee->company_id,
                'accrued_days' => $leaveType->category === 'vacaciones'
                    ? $this->vacationEntitlementDays($employee, $year)
                    : (float) ($leaveType->max_days_per_year ?? 0),
                'used_days' => 0,
            ],
        );
    }

    /**
     * Aplica el efecto de un cambio de estado de una solicitud sobre el saldo del empleado:
     * aprobar suma los días a `used_days`, rechazar/cancelar una que ya estaba aprobada los resta.
     */
    public function applyStatusChange(LeaveRequest $leaveRequest, string $previousStatus, string $newStatus): void
    {
        if ($previousStatus === $newStatus) {
            return;
        }

        $year = $leaveRequest->start_date->year;
        $balance = $this->ensureBalance($leaveRequest->employee, $leaveRequest->leaveType, $year);

        $wasApproved = $previousStatus === 'approved';
        $isApproved = $newStatus === 'approved';

        if ($isApproved && ! $wasApproved) {
            $balance->increment('used_days', $leaveRequest->days_count);
        } elseif ($wasApproved && ! $isApproved) {
            $balance->decrement('used_days', $leaveRequest->days_count);
        }
    }
}
