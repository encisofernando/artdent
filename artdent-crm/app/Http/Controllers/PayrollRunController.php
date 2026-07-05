<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\PayrollRun;
use App\Services\EmployeePayrollService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PayrollRunController extends Controller
{
    public function __construct(private readonly EmployeePayrollService $payrollService) {}

    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;

        $runs = PayrollRun::query()
            ->where('company_id', $companyId)
            ->withCount('receipts')
            ->withSum('receipts', 'net')
            ->orderByDesc('period_from')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Rrhh/Liquidaciones/Index', [
            'runs' => $runs,
        ]);
    }

    public function create(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get(['id', 'user_id', 'salary', 'commission_pct']);

        return Inertia::render('Rrhh/Liquidaciones/Create', [
            'employees' => $employees,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'period_from' => ['required', 'date'],
            'period_to' => ['required', 'date', 'after_or_equal:period_from'],
            'type' => ['required', 'in:mensual,sac,final'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'employee_ids' => ['nullable', 'array'],
            'employee_ids.*' => ['integer', 'exists:employees,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $run = PayrollRun::create([
            'company_id' => $companyId,
            'branch_id' => $validated['branch_id'] ?? null,
            'period_from' => $validated['period_from'],
            'period_to' => $validated['period_to'],
            'type' => $validated['type'],
            'status' => 'draft',
            'generated_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        $employeesQuery = Employee::query()->where('company_id', $companyId)->where('is_active', true);

        if (! empty($validated['employee_ids'])) {
            $employeesQuery->whereIn('id', $validated['employee_ids']);
        }

        $employees = $employeesQuery->get();

        foreach ($employees as $employee) {
            $this->payrollService->generateForEmployee(
                $employee,
                $validated['period_from'],
                $validated['period_to'],
                $run->id,
                $request->user()->id,
            );
        }

        $run->update(['status' => 'calculated']);

        return redirect()->route('payroll-runs.show', $run->id)
            ->with('success', "Liquidación generada para {$employees->count()} empleado(s).");
    }

    public function show(Request $request, PayrollRun $payrollRun): Response
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $payrollRun->company_id === $companyId, 404);

        if ($payrollRun->status === 'calculated') {
            foreach ($payrollRun->receipts as $receipt) {
                $this->payrollService->syncReceipt($receipt);
            }
        }

        $payrollRun->load([
            'branch:id,name',
            'generatedBy:id,name',
            'approvedBy:id,name',
            'receipts.employee.user:id,name',
        ]);

        return Inertia::render('Rrhh/Liquidaciones/Show', [
            'run' => $payrollRun,
        ]);
    }

    public function update(Request $request, PayrollRun $payrollRun): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $payrollRun->company_id === $companyId, 404);

        $validated = $request->validate([
            'status' => ['required', 'in:calculated,approved,paid,closed'],
        ]);

        if ($validated['status'] === 'approved' && $payrollRun->status === 'calculated') {
            $payrollRun->update([
                'status' => 'approved',
                'approved_by' => $request->user()->id,
                'approved_at' => now(),
            ]);
        }

        if ($validated['status'] === 'paid' && $payrollRun->status === 'approved') {
            foreach ($payrollRun->receipts as $receipt) {
                if ($receipt->status === 'draft') {
                    $receipt->update(['status' => 'paid', 'paid_at' => now()]);
                    $this->payrollService->recordExpense($receipt->fresh());
                }
            }

            $payrollRun->update(['status' => 'paid']);
        }

        if ($validated['status'] === 'closed' && $payrollRun->status === 'paid') {
            $payrollRun->update(['status' => 'closed']);
        }

        return back()->with('success', 'Liquidación actualizada.');
    }

    public function destroy(Request $request, PayrollRun $payrollRun): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $payrollRun->company_id === $companyId, 404);

        abort_if(
            $payrollRun->receipts()->where('status', '!=', 'draft')->exists(),
            422,
            'No se puede eliminar: hay recibos pagados o cancelados en esta liquidación.',
        );

        $payrollRun->receipts()->delete();
        $payrollRun->delete();

        return redirect()->route('payroll-runs.index')->with('success', 'Liquidación eliminada.');
    }
}
