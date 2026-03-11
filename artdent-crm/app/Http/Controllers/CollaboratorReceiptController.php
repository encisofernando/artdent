<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\CollaboratorDiscount;
use App\Models\CollaboratorExtra;
use App\Models\CollaboratorReceipt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollaboratorReceiptController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $collaboratorId = $request->input('collaborator_id');
        $status = $request->input('status');

        $query = CollaboratorReceipt::query()
            ->with('collaborator')
            ->where('company_id', $companyId);

        if ($collaboratorId) {
            $query->where('collaborator_id', $collaboratorId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $items = $query->orderBy('period_from', 'desc')->paginate(20)->withQueryString();

        $collaborators = Collaborator::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CollaboratorReceipt/Index', [
            'items' => $items,
            'collaborators' => $collaborators,
            'filters' => [
                'collaborator_id' => $collaboratorId,
                'status' => $status,
            ],
        ]);
    }

    public function create(): void {}

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'collaborator_id' => 'required|exists:collaborators,id',
            'period_from' => 'required|date',
            'period_to' => 'required|date|after_or_equal:period_from',
            'notes' => 'nullable|string|max:1000',
        ]);

        $collaborator = Collaborator::findOrFail($validated['collaborator_id']);

        $attendances = CollaboratorAttendance::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $validated['collaborator_id'])
            ->whereBetween('work_date', [$validated['period_from'], $validated['period_to']])
            ->whereNotNull('time_out')
            ->get();

        $hours = round($attendances->sum('hours'), 2);
        $daysWorked = $attendances->count();
        $gross = round($hours * $collaborator->hourly_rate, 2);

        $extrasTotal = CollaboratorExtra::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $validated['collaborator_id'])
            ->whereBetween('date', [$validated['period_from'], $validated['period_to']])
            ->sum('amount');

        $discountsTotal = CollaboratorDiscount::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $validated['collaborator_id'])
            ->whereBetween('date', [$validated['period_from'], $validated['period_to']])
            ->sum('amount');

        $net = round($gross + $extrasTotal - $discountsTotal, 2);

        $receipt = CollaboratorReceipt::create([
            'company_id' => $companyId,
            'collaborator_id' => $validated['collaborator_id'],
            'created_by' => $request->user()->id,
            'period_from' => $validated['period_from'],
            'period_to' => $validated['period_to'],
            'days_worked' => $daysWorked,
            'hours' => $hours,
            'gross' => $gross,
            'extras_total' => $extrasTotal,
            'discounts_total' => $discountsTotal,
            'net' => $net,
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('collaborator-receipts.show', $receipt->id)
            ->with('success', 'Recibo generado exitosamente.');
    }

    public function show(CollaboratorReceipt $collaboratorReceipt): \Inertia\Response
    {
        $collaboratorReceipt->load('collaborator.company');

        $extras = CollaboratorExtra::query()
            ->where('collaborator_id', $collaboratorReceipt->collaborator_id)
            ->whereBetween('date', [$collaboratorReceipt->period_from, $collaboratorReceipt->period_to])
            ->orderBy('date')
            ->get();

        $discounts = CollaboratorDiscount::query()
            ->where('collaborator_id', $collaboratorReceipt->collaborator_id)
            ->whereBetween('date', [$collaboratorReceipt->period_from, $collaboratorReceipt->period_to])
            ->orderBy('date')
            ->get();

        return Inertia::render('CollaboratorReceipt/Show', [
            'receipt' => $collaboratorReceipt,
            'extras' => $extras,
            'discounts' => $discounts,
            'company' => $collaboratorReceipt->collaborator->company,
        ]);
    }

    public function edit(CollaboratorReceipt $collaboratorReceipt): void {}

    public function update(Request $request, CollaboratorReceipt $collaboratorReceipt): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,paid,cancelled',
            'notes' => 'nullable|string|max:1000',
            'paid_at' => 'nullable|date',
        ]);

        if ($validated['status'] === 'paid' && ! $collaboratorReceipt->paid_at) {
            $validated['paid_at'] = $validated['paid_at'] ?? now()->toDateTimeString();
        }

        $collaboratorReceipt->update($validated);

        return back()->with('success', 'Recibo actualizado.');
    }

    public function destroy(CollaboratorReceipt $collaboratorReceipt): \Illuminate\Http\RedirectResponse
    {
        $collaboratorReceipt->delete();

        return redirect()->route('collaborator-receipts.index')->with('success', 'Recibo eliminado.');
    }
}
