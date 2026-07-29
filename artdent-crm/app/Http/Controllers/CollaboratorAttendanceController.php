<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Services\CollaboratorReceiptSyncService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CollaboratorAttendanceController extends Controller
{
    public function __construct(private readonly CollaboratorReceiptSyncService $receiptSyncService) {}

    private const PERIODS = ['day', 'week', 'month', 'year'];

    public function index(Request $request): \Inertia\Response
    {
        $companyId = CompanyContext::id();
        $collaboratorId = $request->input('collaborator_id');
        $period = $request->input('period', 'week');

        if (! in_array($period, self::PERIODS, true)) {
            $period = 'week';
        }

        [$from, $to] = $this->resolvePeriodRange($period);

        $query = CollaboratorAttendance::query()
            ->with('collaborator')
            ->where('company_id', $companyId)
            ->whereBetween('work_date', [$from->toDateString(), $to->toDateString()]);

        if ($collaboratorId) {
            $query->where('collaborator_id', $collaboratorId);
        }

        $summaryQuery = clone $query;
        $items = $query->orderBy('work_date', 'desc')->orderBy('id', 'desc')->paginate(30)->withQueryString();

        $collaborators = Collaborator::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CollaboratorAttendance/Index', [
            'items' => $items,
            'collaborators' => $collaborators,
            'filters' => [
                'collaborator_id' => $collaboratorId,
                'period' => $period,
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'summary' => [
                'records' => (clone $summaryQuery)->count(),
                'collaborators' => (clone $summaryQuery)->distinct()->count('collaborator_id'),
                'hours' => round((float) ((clone $summaryQuery)->sum('hours') ?? 0), 2),
                'amount' => round((float) ((clone $summaryQuery)->sum('amount') ?? 0), 2),
            ],
        ]);
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    private function resolvePeriodRange(string $period): array
    {
        return match ($period) {
            'day' => [now()->startOfDay(), now()->endOfDay()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
            default => [now()->startOfWeek(), now()->endOfWeek()],
        };
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = Validator::make($request->all(), [
            'collaborator_id' => [
                'required',
                Rule::exists('collaborators', 'id')->where(fn ($query) => $query->where('company_id', $companyId)),
            ],
            'work_date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'method' => 'nullable|in:biometric,manual,system,webauthn',
            'notes' => 'nullable|string|max:500',
        ], [
            'collaborator_id.exists' => 'El colaborador seleccionado no pertenece a esta empresa.',
        ])->after(function ($validator) use ($request) {
            $this->validateTimeRange($validator, $request->input('work_date'), $request->input('time_in'), $request->input('time_out'));
        })->validate();

        $collaborator = Collaborator::query()
            ->where('company_id', $companyId)
            ->findOrFail($validated['collaborator_id']);

        [$hours, $amount] = $this->calculateHoursAndAmount(
            $validated['work_date'],
            $validated['time_in'],
            $validated['time_out'] ?? null,
            (float) $collaborator->hourly_rate,
        );

        CollaboratorAttendance::create([
            'company_id' => $companyId,
            'collaborator_id' => $validated['collaborator_id'],
            'work_date' => $validated['work_date'],
            'time_in' => $validated['time_in'],
            'time_out' => $validated['time_out'] ?? null,
            'hours' => $hours,
            'hourly_rate_snap' => $collaborator->hourly_rate,
            'amount' => $amount,
            'method' => $validated['method'] ?? 'manual',
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->receiptSyncService->syncDraftReceiptsForDate(
            $companyId,
            (int) $validated['collaborator_id'],
            $validated['work_date'],
        );

        return back()->with('success', 'Registro de asistencia creado.');
    }

    public function update(Request $request, CollaboratorAttendance $collaboratorAttendance): \Illuminate\Http\RedirectResponse
    {
        $this->ensureCompanyOwned($collaboratorAttendance, CompanyContext::id());
        $originalDate = $collaboratorAttendance->work_date->toDateString();
        $collaboratorId = (int) $collaboratorAttendance->collaborator_id;
        $companyId = (int) $collaboratorAttendance->company_id;

        $validated = Validator::make($request->all(), [
            'work_date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'method' => 'nullable|in:biometric,manual,system,webauthn',
            'notes' => 'nullable|string|max:500',
        ])->after(function ($validator) use ($request) {
            $this->validateTimeRange($validator, $request->input('work_date'), $request->input('time_in'), $request->input('time_out'));
        })->validate();

        [$hours, $amount] = $this->calculateHoursAndAmount(
            $validated['work_date'],
            $validated['time_in'],
            $validated['time_out'] ?? null,
            (float) ($collaboratorAttendance->hourly_rate_snap ?? 0),
        );

        $collaboratorAttendance->update([
            'work_date' => $validated['work_date'],
            'time_in' => $validated['time_in'],
            'time_out' => $validated['time_out'] ?? null,
            'hours' => $hours,
            'amount' => $amount,
            'method' => $validated['method'] ?? $collaboratorAttendance->method,
            'notes' => $validated['notes'] ?? null,
        ]);

        $this->receiptSyncService->syncDraftReceiptsForDate($companyId, $collaboratorId, $originalDate);
        if ($validated['work_date'] !== $originalDate) {
            $this->receiptSyncService->syncDraftReceiptsForDate($companyId, $collaboratorId, $validated['work_date']);
        }

        return back()->with('success', 'Registro actualizado.');
    }

    public function destroy(CollaboratorAttendance $collaboratorAttendance): \Illuminate\Http\RedirectResponse
    {
        $this->ensureCompanyOwned($collaboratorAttendance, CompanyContext::id());
        $companyId = (int) $collaboratorAttendance->company_id;
        $collaboratorId = (int) $collaboratorAttendance->collaborator_id;
        $workDate = $collaboratorAttendance->work_date->toDateString();

        $collaboratorAttendance->delete();
        $this->receiptSyncService->syncDraftReceiptsForDate($companyId, $collaboratorId, $workDate);

        return back()->with('success', 'Registro eliminado.');
    }

    private function ensureCompanyOwned(CollaboratorAttendance $collaboratorAttendance, int $companyId): void
    {
        abort_unless((int) $collaboratorAttendance->company_id === $companyId, 404);
    }

    private function validateTimeRange($validator, ?string $workDate, ?string $timeIn, ?string $timeOut): void
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

    private function calculateHoursAndAmount(string $workDate, string $timeIn, ?string $timeOut, float $hourlyRate): array
    {
        if (empty($timeOut)) {
            return [null, null];
        }

        $timeInAt = Carbon::parse("{$workDate} {$timeIn}");
        $timeOutAt = Carbon::parse("{$workDate} {$timeOut}");
        $hours = round(($timeOutAt->timestamp - $timeInAt->timestamp) / 3600, 2);

        return [$hours, round($hours * $hourlyRate, 2)];
    }
}
