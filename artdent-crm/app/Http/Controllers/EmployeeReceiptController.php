<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeDiscount;
use App\Models\EmployeeExtra;
use App\Models\EmployeeReceipt;
use App\Services\EmployeePayrollService;
use App\Support\CompanyContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

class EmployeeReceiptController extends Controller
{
    public function __construct(private readonly EmployeePayrollService $payrollService) {}

    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $employeeId = $request->input('employee_id');
        $status = $request->input('status');

        if ($status !== 'paid' && $status !== 'cancelled') {
            $this->payrollService->syncDrafts($companyId, $employeeId ? (int) $employeeId : null);
        }

        $query = EmployeeReceipt::query()
            ->with('employee.user:id,name')
            ->where('company_id', $companyId);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $summaryQuery = clone $query;
        $items = $query->orderByDesc('period_from')->paginate(20)->withQueryString();

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get();

        return Inertia::render('EmployeeReceipt/Index', [
            'items' => $items,
            'employees' => $employees,
            'filters' => ['employee_id' => $employeeId, 'status' => $status],
            'summary' => [
                'receipts' => (clone $summaryQuery)->count(),
                'net' => round((float) ((clone $summaryQuery)->sum('net') ?? 0), 2),
                'paid' => round((float) ((clone $summaryQuery)->where('status', 'paid')->sum('net') ?? 0), 2),
                'draft' => round((float) ((clone $summaryQuery)->where('status', 'draft')->sum('net') ?? 0), 2),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'period_from' => ['required', 'date'],
            'period_to' => ['required', 'date', 'after_or_equal:period_from'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $employee = Employee::query()
            ->where('company_id', $companyId)
            ->findOrFail($validated['employee_id']);

        $totals = $this->payrollService->calculateTotals(
            $employee,
            $validated['period_from'],
            $validated['period_to'],
        );

        $receipt = EmployeeReceipt::create(array_merge([
            'company_id' => $companyId,
            'employee_id' => $employee->id,
            'created_by' => $request->user()->id,
            'period_from' => $validated['period_from'],
            'period_to' => $validated['period_to'],
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ], $totals));

        return redirect()->route('employee-receipts.show', $receipt->id)
            ->with('success', 'Recibo generado.');
    }

    public function show(Request $request, EmployeeReceipt $employeeReceipt): Response
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $employeeReceipt->company_id === $companyId, 404);

        $employeeReceipt = $this->payrollService->syncReceipt($employeeReceipt);
        $employeeReceipt->load(['employee.user:id,name,email', 'creator:id,name', 'lines' => fn ($q) => $q->orderBy('order')]);

        $extras = EmployeeExtra::query()
            ->where('employee_id', $employeeReceipt->employee_id)
            ->whereBetween('date', [$employeeReceipt->period_from, $employeeReceipt->period_to])
            ->orderBy('date')
            ->get();

        $discounts = EmployeeDiscount::query()
            ->where('employee_id', $employeeReceipt->employee_id)
            ->whereBetween('date', [$employeeReceipt->period_from, $employeeReceipt->period_to])
            ->orderBy('date')
            ->get();

        $company = Company::find($companyId);

        return Inertia::render('EmployeeReceipt/Show', [
            'receipt' => $employeeReceipt,
            'extras' => $extras,
            'discounts' => $discounts,
            'company' => $company,
        ]);
    }

    public function pdf(Request $request, EmployeeReceipt $employeeReceipt): BaseResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $employeeReceipt->company_id === $companyId, 404);

        $employeeReceipt = $this->payrollService->syncReceipt($employeeReceipt);
        $employeeReceipt->load([
            'employee.user:id,name,email',
            'employee.branch',
            'employee.department',
            'employee.jobPosition',
            'employee.laborAgreementCategory.laborAgreement',
            'payrollRun',
            'lines' => fn ($q) => $q->orderBy('order')->with('concept:id,code,category,calculation_type'),
        ]);

        $company = Company::find($companyId);

        $pdf = Pdf::loadView('pdf.payslip', [
            'receipt' => $employeeReceipt,
            'company' => $company,
        ])->setPaper('a4', 'portrait');

        $employeeName = str($employeeReceipt->employee->user->name ?? 'empleado')->slug();
        $filename = "recibo-{$employeeName}-{$employeeReceipt->period_from->format('Y-m')}.pdf";

        return $pdf->download($filename);
    }

    public function update(Request $request, EmployeeReceipt $employeeReceipt): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $employeeReceipt->company_id === $companyId, 404);

        $validated = $request->validate([
            'status' => ['required', 'in:draft,paid,cancelled'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'paid_at' => ['nullable', 'date'],
        ]);

        $previousStatus = $employeeReceipt->status;

        if ($validated['status'] === 'paid' && $previousStatus !== 'paid') {
            $validated['paid_at'] = $validated['paid_at'] ?? now()->toDateTimeString();
        }

        $employeeReceipt->update($validated);

        if ($validated['status'] === 'paid' && $previousStatus !== 'paid') {
            $employeeReceipt->refresh();
            $this->payrollService->recordExpense($employeeReceipt);
        }

        if ($validated['status'] === 'cancelled' && $previousStatus === 'paid') {
            $this->payrollService->removeExpense($employeeReceipt);
        }

        return back()->with('success', 'Recibo actualizado.');
    }

    public function destroy(Request $request, EmployeeReceipt $employeeReceipt): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $employeeReceipt->company_id === $companyId, 404);

        $employeeReceipt->delete();

        return redirect()->route('employee-receipts.index')->with('success', 'Recibo eliminado.');
    }
}
