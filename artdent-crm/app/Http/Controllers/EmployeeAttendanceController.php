<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeAttendance;
use App\Services\EmployeePayrollService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as ValidatorContract;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeAttendanceController extends Controller
{
    public function __construct(private readonly EmployeePayrollService $payrollService) {}

    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $employeeId = $request->input('employee_id');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = EmployeeAttendance::query()
            ->with('employee.user:id,name')
            ->where('company_id', $companyId);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($from) {
            $query->where('work_date', '>=', $from);
        }

        if ($to) {
            $query->where('work_date', '<=', $to);
        }

        $summaryQuery = clone $query;
        $items = $query->orderBy('work_date', 'desc')->orderBy('id', 'desc')->paginate(30)->withQueryString();

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get(['id', 'user_id']);

        return Inertia::render('EmployeeAttendance/Index', [
            'items' => $items,
            'employees' => $employees,
            'filters' => [
                'employee_id' => $employeeId,
                'from' => $from,
                'to' => $to,
            ],
            'summary' => [
                'records' => (clone $summaryQuery)->count(),
                'employees' => (clone $summaryQuery)->distinct()->count('employee_id'),
                'hours' => round((float) ((clone $summaryQuery)->sum('hours') ?? 0), 2),
                'absences' => (clone $summaryQuery)->where('is_absent', true)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = Validator::make($request->all(), [
            'employee_id' => [
                'required',
                Rule::exists('employees', 'id')->where(fn ($query) => $query->where('company_id', $companyId)),
            ],
            'work_date' => ['required', 'date'],
            'time_in' => ['nullable', 'date_format:H:i', 'required_if:is_absent,false'],
            'time_out' => ['nullable', 'date_format:H:i'],
            'is_absent' => ['boolean'],
            'absence_reason' => ['nullable', 'string', 'max:191'],
            'method' => ['nullable', 'in:biometric,manual,system,webauthn'],
            'notes' => ['nullable', 'string', 'max:500'],
        ], [
            'employee_id.exists' => 'El empleado seleccionado no pertenece a esta empresa.',
        ])->after(fn (ValidatorContract $validator) => $this->validateTimeRange(
            $validator,
            $request->input('work_date'),
            $request->input('time_in'),
            $request->input('time_out'),
        ))->validate();

        EmployeeAttendance::create([
            'company_id' => $companyId,
            'employee_id' => $validated['employee_id'],
            'work_date' => $validated['work_date'],
            'time_in' => $validated['is_absent'] ?? false ? null : ($validated['time_in'] ?? null),
            'time_out' => $validated['is_absent'] ?? false ? null : ($validated['time_out'] ?? null),
            'hours' => $this->calculateHours($validated['work_date'], $validated['time_in'] ?? null, $validated['time_out'] ?? null),
            'is_absent' => $validated['is_absent'] ?? false,
            'absence_reason' => $validated['absence_reason'] ?? null,
            'method' => $validated['method'] ?? 'manual',
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->payrollService->syncDrafts($companyId, (int) $validated['employee_id']);

        return back()->with('success', 'Registro de asistencia creado.');
    }

    public function update(Request $request, EmployeeAttendance $employeeAttendance): RedirectResponse
    {
        $this->ensureCompanyOwned($employeeAttendance, CompanyContext::id());
        $companyId = (int) $employeeAttendance->company_id;
        $employeeId = (int) $employeeAttendance->employee_id;

        $validated = Validator::make($request->all(), [
            'work_date' => ['required', 'date'],
            'time_in' => ['nullable', 'date_format:H:i', 'required_if:is_absent,false'],
            'time_out' => ['nullable', 'date_format:H:i'],
            'is_absent' => ['boolean'],
            'absence_reason' => ['nullable', 'string', 'max:191'],
            'method' => ['nullable', 'in:biometric,manual,system,webauthn'],
            'notes' => ['nullable', 'string', 'max:500'],
        ])->after(fn (ValidatorContract $validator) => $this->validateTimeRange(
            $validator,
            $request->input('work_date'),
            $request->input('time_in'),
            $request->input('time_out'),
        ))->validate();

        $employeeAttendance->update([
            'work_date' => $validated['work_date'],
            'time_in' => $validated['is_absent'] ?? false ? null : ($validated['time_in'] ?? null),
            'time_out' => $validated['is_absent'] ?? false ? null : ($validated['time_out'] ?? null),
            'hours' => $this->calculateHours($validated['work_date'], $validated['time_in'] ?? null, $validated['time_out'] ?? null),
            'is_absent' => $validated['is_absent'] ?? false,
            'absence_reason' => $validated['absence_reason'] ?? null,
            'method' => $validated['method'] ?? $employeeAttendance->method,
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->payrollService->syncDrafts($companyId, $employeeId);

        return back()->with('success', 'Registro actualizado.');
    }

    public function destroy(Request $request, EmployeeAttendance $employeeAttendance): RedirectResponse
    {
        $this->ensureCompanyOwned($employeeAttendance, CompanyContext::id());
        $companyId = (int) $employeeAttendance->company_id;
        $employeeId = (int) $employeeAttendance->employee_id;

        $employeeAttendance->delete();
        $this->payrollService->syncDrafts($companyId, $employeeId);

        return back()->with('success', 'Registro eliminado.');
    }

    private function ensureCompanyOwned(EmployeeAttendance $employeeAttendance, int $companyId): void
    {
        abort_unless((int) $employeeAttendance->company_id === $companyId, 404);
    }

    private function validateTimeRange(ValidatorContract $validator, ?string $workDate, ?string $timeIn, ?string $timeOut): void
    {
        if (
            $validator->errors()->has('work_date') ||
            $validator->errors()->has('time_in') ||
            $validator->errors()->has('time_out')
        ) {
            return;
        }

        if (empty($workDate) || empty($timeIn) || empty($timeOut)) {
            return;
        }

        $timeInAt = Carbon::parse("{$workDate} {$timeIn}");
        $timeOutAt = Carbon::parse("{$workDate} {$timeOut}");

        if ($timeOutAt->lessThanOrEqualTo($timeInAt)) {
            $validator->errors()->add('time_out', 'La salida debe ser posterior a la entrada.');
        }
    }

    private function calculateHours(string $workDate, ?string $timeIn, ?string $timeOut): float
    {
        if (empty($timeIn) || empty($timeOut)) {
            return 0.0;
        }

        $timeInAt = Carbon::parse("{$workDate} {$timeIn}");
        $timeOutAt = Carbon::parse("{$workDate} {$timeOut}");

        return round(($timeOutAt->timestamp - $timeInAt->timestamp) / 3600, 2);
    }
}
