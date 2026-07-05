<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Models\EmployeeDiscount;
use App\Models\EmployeeExtra;
use App\Models\EmployeeReceipt;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\PayrollConcept;
use App\Models\Sale;
use App\Services\Payroll\FormulaEngine;
use Carbon\Carbon;

class EmployeePayrollService
{
    public function __construct(private readonly FormulaEngine $formulaEngine) {}

    public function calculateTotals(Employee $employee, string $periodFrom, string $periodTo): array
    {
        $salaryGross = round((float) ($employee->salary ?? 0), 2);

        $salesTotal = 0.0;
        $commissionGross = 0.0;

        if ($employee->user_id && $employee->commission_pct > 0) {
            $salesTotal = round((float) Sale::query()
                ->where('user_id', $employee->user_id)
                ->whereIn('status', ['paid', 'completed', 'invoiced'])
                ->whereBetween('sold_at', [$periodFrom.' 00:00:00', $periodTo.' 23:59:59'])
                ->sum('total'), 2);

            $commissionGross = round($salesTotal * $employee->commission_pct / 100, 2);
        }

        $gross = round($salaryGross + $commissionGross, 2);

        $extrasTotal = round((float) EmployeeExtra::query()
            ->where('company_id', $employee->company_id)
            ->where('employee_id', $employee->id)
            ->whereBetween('date', [$periodFrom, $periodTo])
            ->sum('amount'), 2);

        $discountsTotal = round((float) EmployeeDiscount::query()
            ->where('company_id', $employee->company_id)
            ->where('employee_id', $employee->id)
            ->whereBetween('date', [$periodFrom, $periodTo])
            ->sum('amount'), 2);

        $baseTotals = [
            'salary_gross' => $salaryGross,
            'commission_gross' => $commissionGross,
            'gross' => $gross,
            'extras_total' => $extrasTotal,
            'discounts_total' => $discountsTotal,
            'sales_total' => $salesTotal,
        ];

        $conceptResult = $this->calculateConceptLines($employee, $periodFrom, $periodTo, $baseTotals);

        $net = round(
            $gross + $extrasTotal - $discountsTotal + $conceptResult['concepts_total'],
            2,
        );

        return [
            ...$baseTotals,
            'concepts_total' => $conceptResult['concepts_total'],
            'employer_contributions_total' => $conceptResult['employer_contributions_total'],
            'net' => $net,
            'concept_lines' => $conceptResult['lines'],
        ];
    }

    /**
     * Variables del motor de fórmulas disponibles para los conceptos.
     * dias_trabajados sigue siendo un valor calendario (no de asistencia real).
     * ausencias/horas_extra ahora se leen de Control Horario (EmployeeAttendance) —
     * antes eran placeholders en 0 hasta que ese módulo existiera.
     */
    public function buildFormulaVariables(Employee $employee, string $periodFrom, string $periodTo, array $baseTotals): array
    {
        $from = Carbon::parse($periodFrom);
        $to = Carbon::parse($periodTo);

        $antiguedadAnios = $employee->hire_date
            ? (int) $employee->hire_date->diffInYears($to)
            : 0;

        [$semesterStart, $semesterEnd] = $this->semesterBounds($to);

        return [
            'sueldo_basico' => $baseTotals['salary_gross'],
            'comision' => $baseTotals['commission_gross'],
            'ventas_total' => $baseTotals['sales_total'],
            'antiguedad_anios' => $antiguedadAnios,
            'dias_trabajados' => $from->diffInDays($to) + 1,
            'ausencias' => $this->countAbsences($employee, $periodFrom, $periodTo),
            'horas_extra' => $this->sumOvertimeHours($employee, $periodFrom, $periodTo),
            'mes_liquidacion' => (int) $to->format('n'),
            // Variables para el SAC (Ley 23.041): "mejor remuneración mensual del semestre / 2".
            // remunerativo_parcial_mes arranca en sueldo+comisión y se va actualizando a medida
            // que se resuelven los conceptos remunerativos del propio período (ver pasada 1 de
            // calculateConceptLines), para que esté disponible como candidato al comparar contra
            // los otros meses del semestre ya liquidados.
            'remunerativo_parcial_mes' => round($baseTotals['salary_gross'] + $baseTotals['commission_gross'], 2),
            'mejor_remuneracion_semestre_previa' => $this->bestOtherMonthRemuneration($employee, $periodFrom, $periodTo, $semesterStart, $semesterEnd),
            'proporcion_sac' => $this->sacProportion($employee, $semesterStart, $semesterEnd),
        ];
    }

    /**
     * Límites del semestre (Ley 23.041: 1° semestre ene-jun, 2° semestre jul-dic) que contiene
     * la fecha dada.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    private function semesterBounds(Carbon $date): array
    {
        return $date->month <= 6
            ? [Carbon::create($date->year, 1, 1), Carbon::create($date->year, 6, 30)]
            : [Carbon::create($date->year, 7, 1), Carbon::create($date->year, 12, 31)];
    }

    /**
     * Mayor remuneración remunerativa mensual ya liquidada en el semestre, excluyendo el
     * período actual (que todavía se está calculando). Solo mira recibos no cancelados —
     * es la base histórica que el SAC del mes actual debe superar (o no) para el "mejor mes".
     */
    private function bestOtherMonthRemuneration(Employee $employee, string $periodFrom, string $periodTo, Carbon $semesterStart, Carbon $semesterEnd): float
    {
        $receipts = EmployeeReceipt::query()
            ->where('employee_id', $employee->id)
            ->where('status', '!=', 'cancelled')
            ->where('period_from', '>=', $semesterStart->toDateString())
            ->where('period_to', '<=', $semesterEnd->toDateString())
            ->where(fn ($q) => $q->where('period_from', '!=', $periodFrom)->orWhere('period_to', '!=', $periodTo))
            ->with('lines')
            ->get();

        $best = 0.0;
        foreach ($receipts as $receipt) {
            $remunerativo = $receipt->salary_gross + $receipt->commission_gross
                + $receipt->lines->where('type', 'remunerative')->sum('amount');
            $best = max($best, $remunerativo);
        }

        return round($best, 2);
    }

    /**
     * Proporción del semestre efectivamente trabajada, para el SAC proporcional (Ley 23.041)
     * cuando el ingreso ocurrió durante el semestre. No contempla egreso/liquidación final
     * (proporcional al cese) — eso corresponde a una liquidación final, todavía no implementada.
     */
    private function sacProportion(Employee $employee, Carbon $semesterStart, Carbon $semesterEnd): float
    {
        if (! $employee->hire_date || $employee->hire_date->lessThanOrEqualTo($semesterStart)) {
            return 1.0;
        }

        if ($employee->hire_date->greaterThan($semesterEnd)) {
            return 0.0;
        }

        $totalDays = $semesterStart->diffInDays($semesterEnd) + 1;
        $workedDays = $employee->hire_date->diffInDays($semesterEnd) + 1;

        return round(min($workedDays / $totalDays, 1.0), 6);
    }

    /**
     * Cantidad de ausencias (Control Horario) registradas en el período.
     */
    private function countAbsences(Employee $employee, string $periodFrom, string $periodTo): int
    {
        return EmployeeAttendance::where('employee_id', $employee->id)
            ->whereBetween('work_date', [$periodFrom, $periodTo])
            ->where('is_absent', true)
            ->count();
    }

    /**
     * Horas extra del período (Control Horario): horas trabajadas por encima de 8 por
     * jornada, sumadas. Simplificación — no contempla convenios con jornada distinta a 8hs.
     */
    private function sumOvertimeHours(Employee $employee, string $periodFrom, string $periodTo): float
    {
        return round(EmployeeAttendance::where('employee_id', $employee->id)
            ->whereBetween('work_date', [$periodFrom, $periodTo])
            ->where('is_absent', false)
            ->get()
            ->sum(fn (EmployeeAttendance $attendance) => max(0, $attendance->hours - 8)), 2);
    }

    /**
     * Calcula las líneas de conceptos parametrizables (motor de fórmulas) para un empleado
     * y período dados. Si no hay conceptos activos con fórmula vigente, devuelve totales
     * en cero y no altera el cálculo tradicional (retrocompatible).
     *
     * Se resuelve en dos pasadas, igual que un sistema de liquidación real: primero los
     * conceptos remunerativos/no remunerativos (haberes), y recién después los aportes,
     * contribuciones y descuentos — porque en la práctica (y así lo confirma el recibo real
     * de referencia UECARA) los aportes/contribuciones NO se calculan solo sobre el sueldo
     * básico, sino sobre el total remunerativo del período (básico + presentismo + antigüedad
     * + SAC, etc.). Por eso la variable `remunerativo_total` solo está disponible en la
     * segunda pasada.
     */
    public function calculateConceptLines(Employee $employee, string $periodFrom, string $periodTo, array $baseTotals): array
    {
        $variables = $this->buildFormulaVariables($employee, $periodFrom, $periodTo, $baseTotals);

        $concepts = PayrollConcept::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $employee->company_id))
            ->where('is_active', true)
            ->orderBy('order')
            ->orderBy('name')
            ->get();

        $haberConcepts = $concepts->whereIn('type', ['remunerative', 'non_remunerative']);
        $cargaConcepts = $concepts->whereIn('type', ['deduction', 'contribution', 'employer_contribution']);

        $lines = [];
        $conceptsTotal = 0.0;
        $employerContributionsTotal = 0.0;
        $remunerativoTotal = $baseTotals['salary_gross'] + $baseTotals['commission_gross'];
        $noRemunerativoTotal = 0.0;

        // Pasada 1: haberes (remunerativos y no remunerativos). La base de cálculo de estos
        // conceptos (presentismo, antigüedad, etc.) es el sueldo básico.
        foreach ($haberConcepts as $concept) {
            $line = $this->evaluateConcept($concept, $variables, $variables['sueldo_basico']);
            if (! $line) {
                continue;
            }

            $lines[] = $line;
            $conceptsTotal += $line['amount'];

            if ($concept->type === 'remunerative') {
                $remunerativoTotal += $line['amount'];
                // Se actualiza en cada vuelta (no solo al final) para que un concepto
                // remunerativo posterior en el orden (ej. SAC) pueda usar el acumulado de
                // los remunerativos ya resueltos este mismo período — ver `remunerativo_parcial_mes`.
                $variables['remunerativo_parcial_mes'] = round($remunerativoTotal, 2);
            } else {
                $noRemunerativoTotal += $line['amount'];
            }
        }

        // Pasada 2: aportes, contribuciones y descuentos. Su base de cálculo habitual es el
        // total remunerativo del período (no solo el básico), ya disponible en `variables`.
        $variables['remunerativo_total'] = round($remunerativoTotal, 2);
        $variables['no_remunerativo_total'] = round($noRemunerativoTotal, 2);

        foreach ($cargaConcepts as $concept) {
            $line = $this->evaluateConcept($concept, $variables, $variables['remunerativo_total']);
            if (! $line) {
                continue;
            }

            $lines[] = $line;

            match ($concept->type) {
                'deduction', 'contribution' => $conceptsTotal -= $line['amount'],
                'employer_contribution' => $employerContributionsTotal += $line['amount'],
                default => null,
            };
        }

        return [
            'lines' => $lines,
            'concepts_total' => round($conceptsTotal, 2),
            'employer_contributions_total' => round($employerContributionsTotal, 2),
        ];
    }

    /**
     * Evalúa un concepto individual y arma su línea de recibo, incluyendo la base de cálculo
     * y unidad de medida exigidas por el Decreto 407/2026 (Anexo I art. 5) cuando el concepto
     * es porcentual. `$defaultBase` es la base convencional para ese tipo de concepto (sueldo
     * básico para haberes, total remunerativo para aportes/contribuciones/descuentos).
     */
    private function evaluateConcept(PayrollConcept $concept, array $variables, float $defaultBase): ?array
    {
        $version = $concept->currentVersion();
        if (! $version) {
            return null;
        }

        try {
            $amount = round($this->formulaEngine->evaluate($version->formula, $variables), 2);
        } catch (\Throwable) {
            // Una fórmula con error no debe romper toda la liquidación; se omite esa línea.
            return null;
        }

        $baseAmount = null;
        $rate = null;
        if ($concept->calculation_type === 'percentage' && $defaultBase > 0) {
            $baseAmount = $defaultBase;
            $rate = round($amount / $baseAmount * 100, 4);
        }

        return [
            'payroll_concept_id' => $concept->id,
            'label' => $concept->name,
            'type' => $concept->type,
            'amount' => $amount,
            'base_amount' => $baseAmount,
            'rate' => $rate,
            'formula_snapshot' => $version->formula,
            'order' => $concept->order,
        ];
    }

    public function syncReceipt(EmployeeReceipt $receipt): EmployeeReceipt
    {
        if ($receipt->status !== 'draft') {
            return $receipt;
        }

        $employee = $receipt->employee;
        $totals = $this->calculateTotals(
            $employee,
            $receipt->period_from->toDateString(),
            $receipt->period_to->toDateString(),
        );

        $conceptLines = $totals['concept_lines'];
        unset($totals['concept_lines']);
        $totals['formula_snapshot'] = $conceptLines;

        $receipt->fill($totals);

        $dirty = $receipt->isDirty([
            'salary_gross', 'commission_gross', 'gross', 'extras_total', 'discounts_total',
            'concepts_total', 'employer_contributions_total', 'net', 'sales_total',
        ]);

        if ($dirty) {
            $receipt->save();
            $receipt->refresh();
        }

        $this->syncConceptLines($receipt, $conceptLines);

        return $receipt;
    }

    private function syncConceptLines(EmployeeReceipt $receipt, array $conceptLines): void
    {
        $receipt->lines()->delete();

        foreach ($conceptLines as $line) {
            $receipt->lines()->create($line);
        }
    }

    /**
     * Genera (o recupera, si ya existe) el recibo de un empleado para un período,
     * opcionalmente asociado a una liquidación (payroll run) masiva.
     */
    public function generateForEmployee(Employee $employee, string $periodFrom, string $periodTo, ?int $payrollRunId, int $createdBy): EmployeeReceipt
    {
        $existing = EmployeeReceipt::where('employee_id', $employee->id)
            ->where('period_from', $periodFrom)
            ->where('period_to', $periodTo)
            ->first();

        if ($existing) {
            if ($payrollRunId && ! $existing->payroll_run_id) {
                $existing->update(['payroll_run_id' => $payrollRunId]);
            }

            return $this->syncReceipt($existing);
        }

        $totals = $this->calculateTotals($employee, $periodFrom, $periodTo);
        $conceptLines = $totals['concept_lines'];
        unset($totals['concept_lines']);

        $receipt = EmployeeReceipt::create([
            'company_id' => $employee->company_id,
            'employee_id' => $employee->id,
            'payroll_run_id' => $payrollRunId,
            'created_by' => $createdBy,
            'period_from' => $periodFrom,
            'period_to' => $periodTo,
            'status' => 'draft',
            'formula_snapshot' => $conceptLines,
            ...$totals,
        ]);

        $this->syncConceptLines($receipt, $conceptLines);

        return $receipt;
    }

    public function recordExpense(EmployeeReceipt $receipt): void
    {
        $reference = "EMP-REC-{$receipt->id}";

        if (Expense::where('company_id', $receipt->company_id)->where('reference', $reference)->exists()) {
            return;
        }

        $receipt->loadMissing('employee.user:id,name');
        $employeeName = $receipt->employee?->user?->name ?? "Empleado #{$receipt->employee_id}";

        $category = ExpenseCategory::firstOrCreate(
            ['name' => 'Sueldos y personal'],
            ['type' => 'expense'],
        );

        $from = Carbon::parse($receipt->period_from)->format('d/m/Y');
        $to = Carbon::parse($receipt->period_to)->format('d/m/Y');

        Expense::create([
            'company_id' => $receipt->company_id,
            'scope' => 'store',
            'expense_category_id' => $category->id,
            'user_id' => auth()->id(),
            'description' => "Sueldo {$employeeName} — {$from} al {$to}",
            'amount' => $receipt->net,
            'expense_date' => $receipt->paid_at ?? now(),
            'reference' => $reference,
        ]);
    }

    public function removeExpense(EmployeeReceipt $receipt): void
    {
        Expense::where('company_id', $receipt->company_id)
            ->where('reference', "EMP-REC-{$receipt->id}")
            ->delete();
    }

    public function syncDrafts(int $companyId, ?int $employeeId = null): void
    {
        EmployeeReceipt::query()
            ->with('employee')
            ->where('company_id', $companyId)
            ->where('status', 'draft')
            ->when($employeeId, fn ($q) => $q->where('employee_id', $employeeId))
            ->get()
            ->each(fn (EmployeeReceipt $r) => $this->syncReceipt($r));
    }
}
