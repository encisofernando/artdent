<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeReceipt;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\EmployeePayrollService;
use App\Services\LeaveService;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as BaseResponse;

/**
 * Portal de autogestión del empleado: no requiere permisos `staff.*`/`rrhh.*` — se habilita
 * automáticamente para cualquier User con un Employee asociado (auth()->user()->employee).
 * Solo expone datos/acciones sobre el PROPIO legajo, nunca de otros empleados.
 */
class EmployeePortalController extends Controller
{
    public function __construct(private readonly LeaveService $leaveService) {}

    private function currentEmployee(Request $request): Employee
    {
        $employee = $request->user()->employee;

        abort_unless($employee, 403, 'Tu usuario no tiene un legajo de empleado asociado.');

        return $employee;
    }

    public function index(Request $request): Response
    {
        $employee = $this->currentEmployee($request)->load(['user:id,name,email', 'department:id,name', 'jobPosition:id,name', 'laborAgreementCategory:id,name']);

        $recentReceipts = EmployeeReceipt::query()
            ->where('employee_id', $employee->id)
            ->orderByDesc('period_from')
            ->limit(3)
            ->get(['id', 'period_from', 'period_to', 'net', 'status']);

        $vacationType = LeaveType::where('category', 'vacaciones')->where('is_active', true)->first();
        $vacationBalance = $vacationType ? $this->leaveService->ensureBalance($employee, $vacationType, now()->year) : null;

        $pendingRequests = LeaveRequest::query()
            ->where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->count();

        return Inertia::render('Rrhh/Portal/Index', [
            'employee' => $employee,
            'recentReceipts' => $recentReceipts,
            'vacationBalance' => $vacationBalance ? [
                'accrued_days' => $vacationBalance->accrued_days,
                'used_days' => $vacationBalance->used_days,
                'remaining_days' => $vacationBalance->remainingDays(),
            ] : null,
            'pendingRequests' => $pendingRequests,
        ]);
    }

    public function misRecibos(Request $request): Response
    {
        $employee = $this->currentEmployee($request);

        $receipts = EmployeeReceipt::query()
            ->where('employee_id', $employee->id)
            ->orderByDesc('period_from')
            ->paginate(12);

        return Inertia::render('Rrhh/Portal/MisRecibos', [
            'receipts' => $receipts,
        ]);
    }

    public function reciboPdf(Request $request, EmployeeReceipt $employeeReceipt): BaseResponse
    {
        $employee = $this->currentEmployee($request);
        abort_unless((int) $employeeReceipt->employee_id === $employee->id, 404);

        $payrollService = app(EmployeePayrollService::class);
        $employeeReceipt = $payrollService->syncReceipt($employeeReceipt);
        $employeeReceipt->load([
            'employee.user:id,name,email',
            'employee.branch',
            'employee.department',
            'employee.jobPosition',
            'employee.laborAgreementCategory.laborAgreement',
            'payrollRun',
            'lines' => fn ($q) => $q->orderBy('order')->with('concept:id,code,category,calculation_type'),
        ]);

        $company = \App\Models\Company::find($employeeReceipt->company_id);

        $pdf = Pdf::loadView('pdf.payslip', ['receipt' => $employeeReceipt, 'company' => $company])->setPaper('a4', 'portrait');

        $employeeName = str($employeeReceipt->employee->user->name ?? 'empleado')->slug();
        $filename = "recibo-{$employeeName}-{$employeeReceipt->period_from->format('Y-m')}.pdf";

        return $pdf->download($filename);
    }

    public function misLicencias(Request $request): Response
    {
        $employee = $this->currentEmployee($request);
        $year = (int) $request->input('year', now()->year);

        $leaveTypes = LeaveType::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $employee->company_id))
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $balances = $leaveTypes->map(function (LeaveType $type) use ($employee, $year) {
            $balance = $this->leaveService->ensureBalance($employee, $type, $year);

            return [
                'leave_type_id' => $type->id,
                'leave_type_name' => $type->name,
                'accrued_days' => $balance->accrued_days,
                'used_days' => $balance->used_days,
                'remaining_days' => $balance->remainingDays(),
            ];
        });

        $requests = LeaveRequest::query()
            ->with('leaveType')
            ->where('employee_id', $employee->id)
            ->orderByDesc('start_date')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Rrhh/Portal/MisLicencias', [
            'leaveTypes' => $leaveTypes,
            'balances' => $balances,
            'requests' => $requests,
            'filters' => ['year' => $year],
        ]);
    }

    public function storeLicencia(Request $request): RedirectResponse
    {
        $employee = $this->currentEmployee($request);

        $validated = $request->validate([
            'leave_type_id' => ['required', 'integer', 'exists:leave_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $leaveType = LeaveType::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $employee->company_id))
            ->findOrFail($validated['leave_type_id']);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);

        LeaveRequest::create([
            'company_id' => $employee->company_id,
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => $start,
            'end_date' => $end,
            'days_count' => $start->diffInDays($end) + 1,
            'status' => 'pending',
            'requested_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Solicitud enviada. Quedará pendiente de aprobación.');
    }

    public function cancelLicencia(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $employee = $this->currentEmployee($request);
        abort_unless((int) $leaveRequest->employee_id === $employee->id, 404);
        abort_unless($leaveRequest->status === 'pending', 422, 'Solo se pueden cancelar solicitudes pendientes.');

        $leaveRequest->delete();

        return back()->with('success', 'Solicitud cancelada.');
    }

    public function miLegajo(Request $request): Response
    {
        $employee = $this->currentEmployee($request)->load([
            'user:id,name,email',
            'department:id,name',
            'jobPosition:id,name',
            'supervisor.user:id,name',
            'laborAgreementCategory.laborAgreement',
            'documents' => fn ($q) => $q->orderByDesc('created_at'),
            'familyMembers' => fn ($q) => $q->orderBy('name'),
        ]);

        return Inertia::render('Rrhh/Portal/MiLegajo', [
            'employee' => $employee,
        ]);
    }

    /**
     * El empleado solo puede editar sus propios datos de contacto/bancarios — no salario,
     * categoría, convenio ni cualquier campo con impacto legal/administrativo.
     */
    public function updateLegajo(Request $request): RedirectResponse
    {
        $employee = $this->currentEmployee($request);

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:30'],
            'personal_email' => ['nullable', 'email', 'max:191'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'bank_cbu' => ['nullable', 'string', 'max:22'],
            'bank_name' => ['nullable', 'string', 'max:100'],
        ]);

        $employee->update($validated);

        return back()->with('success', 'Datos actualizados.');
    }
}
