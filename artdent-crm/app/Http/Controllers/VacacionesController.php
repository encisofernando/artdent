<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\LeaveService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VacacionesController extends Controller
{
    public function __construct(private readonly LeaveService $leaveService) {}

    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $year = (int) $request->input('year', now()->year);
        $employeeId = $request->input('employee_id');
        $status = $request->input('status');

        $leaveTypes = LeaveType::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->where('is_active', true)
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'user_id', 'hire_date']);

        $vacationType = $leaveTypes->firstWhere('category', 'vacaciones');
        $balances = collect();
        if ($vacationType) {
            $balances = $employees->map(function (Employee $employee) use ($vacationType, $year) {
                $balance = $this->leaveService->ensureBalance($employee, $vacationType, $year);

                return [
                    'employee_id' => $employee->id,
                    'employee_name' => $employee->user?->name ?? "Empleado #{$employee->id}",
                    'accrued_days' => $balance->accrued_days,
                    'used_days' => $balance->used_days,
                    'remaining_days' => $balance->remainingDays(),
                ];
            })->values();
        }

        $requestsQuery = LeaveRequest::query()
            ->with(['employee.user:id,name', 'leaveType', 'approvedBy:id,name'])
            ->where('company_id', $companyId);

        if ($employeeId) {
            $requestsQuery->where('employee_id', $employeeId);
        }

        if ($status) {
            $requestsQuery->where('status', $status);
        }

        $requests = $requestsQuery->orderByDesc('start_date')->paginate(20)->withQueryString();

        return Inertia::render('Rrhh/Vacaciones/Index', [
            'leaveTypes' => $leaveTypes,
            'employees' => $employees,
            'balances' => $balances,
            'requests' => $requests,
            'filters' => ['year' => $year, 'employee_id' => $employeeId, 'status' => $status],
        ]);
    }
}
