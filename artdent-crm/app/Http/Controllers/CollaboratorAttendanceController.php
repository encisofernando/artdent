<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollaboratorAttendanceController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $collaboratorId = $request->input('collaborator_id');
        $from = $request->input('from');
        $to = $request->input('to');

        $query = CollaboratorAttendance::query()
            ->with('collaborator')
            ->where('company_id', $companyId);

        if ($collaboratorId) {
            $query->where('collaborator_id', $collaboratorId);
        }

        if ($from) {
            $query->where('work_date', '>=', $from);
        }

        if ($to) {
            $query->where('work_date', '<=', $to);
        }

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
                'from' => $from,
                'to' => $to,
            ],
        ]);
    }

    public function create(): void {}

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'collaborator_id' => 'required|exists:collaborators,id',
            'work_date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'method' => 'nullable|in:biometric,manual,system,webauthn',
            'notes' => 'nullable|string|max:500',
        ]);

        $collaborator = Collaborator::findOrFail($validated['collaborator_id']);

        $hours = null;
        $amount = null;

        if (! empty($validated['time_out'])) {
            $timeIn = Carbon::parse("{$validated['work_date']} {$validated['time_in']}");
            $timeOut = Carbon::parse("{$validated['work_date']} {$validated['time_out']}");
            $hours = round(($timeOut->timestamp - $timeIn->timestamp) / 3600, 2);
            $amount = round($hours * $collaborator->hourly_rate, 2);
        }

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

        return back()->with('success', 'Registro de asistencia creado.');
    }

    public function show(CollaboratorAttendance $collaboratorAttendance): void {}

    public function edit(CollaboratorAttendance $collaboratorAttendance): void {}

    public function update(Request $request, CollaboratorAttendance $collaboratorAttendance): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'work_date' => 'required|date',
            'time_in' => 'required|date_format:H:i',
            'time_out' => 'nullable|date_format:H:i',
            'method' => 'nullable|in:biometric,manual,system,webauthn',
            'notes' => 'nullable|string|max:500',
        ]);

        $hours = null;
        $amount = null;

        if (! empty($validated['time_out'])) {
            $timeIn = Carbon::parse("{$validated['work_date']} {$validated['time_in']}");
            $timeOut = Carbon::parse("{$validated['work_date']} {$validated['time_out']}");
            $hours = round(($timeOut->timestamp - $timeIn->timestamp) / 3600, 2);
            $amount = round($hours * ($collaboratorAttendance->hourly_rate_snap ?? 0), 2);
        }

        $collaboratorAttendance->update([
            'work_date' => $validated['work_date'],
            'time_in' => $validated['time_in'],
            'time_out' => $validated['time_out'] ?? null,
            'hours' => $hours,
            'amount' => $amount,
            'method' => $validated['method'] ?? $collaboratorAttendance->method,
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', 'Registro actualizado.');
    }

    public function destroy(CollaboratorAttendance $collaboratorAttendance): \Illuminate\Http\RedirectResponse
    {
        $collaboratorAttendance->delete();

        return back()->with('success', 'Registro eliminado.');
    }
}
