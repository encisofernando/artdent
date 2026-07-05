<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeReceipt;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportesRrhhController extends Controller
{
    private const MONTHS_BACK = 5;

    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $months = $this->lastMonths(self::MONTHS_BACK);

        return Inertia::render('Rrhh/Reportes/Index', [
            'kpis' => $this->buildKpis($companyId),
            'headcountByDepartment' => $this->headcountByDepartment($companyId),
            'rotacion' => $this->rotacionPorMes($companyId, $months),
            'ausentismo' => $this->ausentismoPorMes($companyId, $months),
            'masaSalarial' => $this->masaSalarialPorMes($companyId, $months),
        ]);
    }

    /**
     * @return array<int, array{start: Carbon, end: Carbon, label: string}>
     */
    private function lastMonths(int $count): array
    {
        $months = [];
        for ($i = $count; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $months[] = [
                'start' => $date->copy()->startOfMonth(),
                'end' => $date->copy()->endOfMonth(),
                'label' => ucfirst($date->locale('es')->translatedFormat('M Y')),
            ];
        }

        return $months;
    }

    private function buildKpis(int $companyId): array
    {
        $activeEmployees = Employee::where('company_id', $companyId)->where('is_active', true)->get(['hire_date']);

        $avgTenureYears = $activeEmployees->isEmpty()
            ? 0.0
            : round($activeEmployees->avg(fn (Employee $e) => $e->hire_date ? $e->hire_date->diffInDays(now()) / 365 : 0), 1);

        return [
            'active_employees' => $activeEmployees->count(),
            'avg_tenure_years' => $avgTenureYears,
            'hires_last_12_months' => Employee::where('company_id', $companyId)
                ->whereBetween('hire_date', [now()->subMonths(12), now()])
                ->count(),
            'terminations_last_12_months' => Employee::where('company_id', $companyId)
                ->whereBetween('end_date', [now()->subMonths(12), now()])
                ->count(),
        ];
    }

    private function headcountByDepartment(int $companyId): array
    {
        return Department::query()
            ->where('company_id', $companyId)
            ->withCount(['employees' => fn ($q) => $q->where('is_active', true)])
            ->orderByDesc('employees_count')
            ->get()
            ->map(fn (Department $d) => ['name' => $d->name, 'value' => $d->employees_count])
            ->filter(fn ($row) => $row['value'] > 0)
            ->values()
            ->all();
    }

    /**
     * Rotación: altas y bajas por mes + tasa de rotación (bajas / dotación promedio).
     */
    private function rotacionPorMes(int $companyId, array $months): array
    {
        return collect($months)->map(function (array $month) use ($companyId) {
            $hires = Employee::where('company_id', $companyId)
                ->whereBetween('hire_date', [$month['start'], $month['end']])
                ->count();

            $terminations = Employee::where('company_id', $companyId)
                ->whereBetween('end_date', [$month['start'], $month['end']])
                ->count();

            $headcountAtEnd = Employee::where('company_id', $companyId)
                ->where('hire_date', '<=', $month['end'])
                ->where(fn ($q) => $q->whereNull('end_date')->orWhere('end_date', '>=', $month['end']))
                ->count();

            return [
                'label' => $month['label'],
                'altas' => $hires,
                'bajas' => $terminations,
                'dotacion' => $headcountAtEnd,
                'rotacion_pct' => $headcountAtEnd > 0 ? round($terminations / $headcountAtEnd * 100, 1) : 0.0,
            ];
        })->all();
    }

    /**
     * Ausentismo: días de ausencia por Control Horario (is_absent) + días de licencia
     * aprobados que se solapan con el mes, sumados.
     */
    private function ausentismoPorMes(int $companyId, array $months): array
    {
        return collect($months)->map(function (array $month) use ($companyId) {
            $attendanceAbsences = EmployeeAttendance::where('company_id', $companyId)
                ->where('is_absent', true)
                ->whereBetween('work_date', [$month['start']->toDateString(), $month['end']->toDateString()])
                ->count();

            $leaveDays = LeaveRequest::where('company_id', $companyId)
                ->where('status', 'approved')
                ->where('start_date', '<=', $month['end']->toDateString())
                ->where('end_date', '>=', $month['start']->toDateString())
                ->get()
                ->sum(function (LeaveRequest $r) use ($month) {
                    $overlapStart = $r->start_date->max($month['start']);
                    $overlapEnd = $r->end_date->min($month['end']);

                    return max(0, $overlapStart->diffInDays($overlapEnd) + 1);
                });

            return [
                'label' => $month['label'],
                'ausencias_fichaje' => $attendanceAbsences,
                'dias_licencia' => round($leaveDays, 1),
                'total' => round($attendanceAbsences + $leaveDays, 1),
            ];
        })->all();
    }

    /**
     * Masa salarial: neto, bruto y costo patronal por período de recibo (agrupado por el mes
     * de `period_from`).
     */
    private function masaSalarialPorMes(int $companyId, array $months): array
    {
        return collect($months)->map(function (array $month) use ($companyId) {
            $receipts = EmployeeReceipt::where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('period_from', [$month['start']->toDateString(), $month['end']->toDateString()])
                ->get(['net', 'gross', 'employer_contributions_total']);

            return [
                'label' => $month['label'],
                'neto' => round((float) $receipts->sum('net'), 2),
                'bruto' => round((float) $receipts->sum('gross'), 2),
                'costo_empleador' => round((float) $receipts->sum('gross') + (float) $receipts->sum('employer_contributions_total'), 2),
            ];
        })->all();
    }
}
