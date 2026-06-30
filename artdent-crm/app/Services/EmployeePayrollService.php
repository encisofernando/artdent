<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeDiscount;
use App\Models\EmployeeExtra;
use App\Models\EmployeeReceipt;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Sale;
use Carbon\Carbon;

class EmployeePayrollService
{
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

        return [
            'salary_gross' => $salaryGross,
            'commission_gross' => $commissionGross,
            'gross' => $gross,
            'extras_total' => $extrasTotal,
            'discounts_total' => $discountsTotal,
            'net' => round($gross + $extrasTotal - $discountsTotal, 2),
            'sales_total' => $salesTotal,
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

        $receipt->fill($totals);

        if ($receipt->isDirty(['salary_gross', 'commission_gross', 'gross', 'extras_total', 'discounts_total', 'net', 'sales_total'])) {
            $receipt->save();
            $receipt->refresh();
        }

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
