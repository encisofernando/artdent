<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Services\LeaveService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LeaveRequestController extends Controller
{
    public function __construct(private readonly LeaveService $leaveService) {}

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'leave_type_id' => ['required', 'integer', 'exists:leave_types,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $employee = Employee::query()->where('company_id', $companyId)->findOrFail($validated['employee_id']);
        $leaveType = LeaveType::query()
            ->where(fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->findOrFail($validated['leave_type_id']);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $daysCount = $start->diffInDays($end) + 1;

        LeaveRequest::create([
            'company_id' => $companyId,
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => $start,
            'end_date' => $end,
            'days_count' => $daysCount,
            'status' => 'pending',
            'requested_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Solicitud de licencia creada.');
    }

    public function update(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $leaveRequest->company_id === $companyId, 404);

        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected,cancelled'],
        ]);

        $previousStatus = $leaveRequest->status;

        if ($validated['status'] === 'approved' && $previousStatus !== 'approved') {
            $leaveRequest->loadMissing('employee', 'leaveType');
            $year = $leaveRequest->start_date->year;
            $balance = $this->leaveService->ensureBalance($leaveRequest->employee, $leaveRequest->leaveType, $year);

            if ($leaveRequest->days_count > $balance->remainingDays()) {
                throw ValidationException::withMessages([
                    'status' => "No se puede aprobar: el empleado tiene {$balance->remainingDays()} día(s) disponibles de {$leaveRequest->leaveType->name} y la solicitud pide {$leaveRequest->days_count}.",
                ]);
            }
        }

        $leaveRequest->update([
            'status' => $validated['status'],
            'approved_by' => in_array($validated['status'], ['approved', 'rejected'], true) ? $request->user()->id : $leaveRequest->approved_by,
            'approved_at' => in_array($validated['status'], ['approved', 'rejected'], true) ? now() : $leaveRequest->approved_at,
        ]);

        $this->leaveService->applyStatusChange($leaveRequest->fresh(['employee', 'leaveType']), $previousStatus, $validated['status']);

        return back()->with('success', 'Solicitud actualizada.');
    }

    public function destroy(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $leaveRequest->company_id === $companyId, 404);

        abort_if($leaveRequest->status === 'approved', 422, 'No se puede eliminar una solicitud aprobada: cancelala primero.');

        $leaveRequest->delete();

        return back()->with('success', 'Solicitud eliminada.');
    }
}
