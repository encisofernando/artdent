<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorDiscount;
use App\Models\CollaboratorExtra;
use App\Models\CollaboratorReceipt;
use App\Services\CollaboratorReceiptSyncService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CollaboratorReceiptController extends Controller
{
    public function __construct(private readonly CollaboratorReceiptSyncService $receiptSyncService)
    {
    }

    public function index(Request $request): \Inertia\Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $collaboratorId = $request->input('collaborator_id');
        $status = $request->input('status');

        if ($status !== 'paid' && $status !== 'cancelled') {
            $this->receiptSyncService->syncDraftReceipts($companyId, $collaboratorId ? (int) $collaboratorId : null);
        }

        $query = CollaboratorReceipt::query()
            ->with('collaborator')
            ->where('company_id', $companyId);

        if ($collaboratorId) {
            $query->where('collaborator_id', $collaboratorId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        $summaryQuery = clone $query;
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
            'summary' => [
                'receipts' => (clone $summaryQuery)->count(),
                'net' => round((float) ((clone $summaryQuery)->sum('net') ?? 0), 2),
                'paid' => round((float) ((clone $summaryQuery)->where('status', 'paid')->sum('net') ?? 0), 2),
                'draft' => round((float) ((clone $summaryQuery)->where('status', 'draft')->sum('net') ?? 0), 2),
            ],
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'collaborator_id' => [
                'required',
                Rule::exists('collaborators', 'id')->where(fn ($query) => $query->where('company_id', $companyId)),
            ],
            'period_from' => 'required|date',
            'period_to' => 'required|date|after_or_equal:period_from',
            'notes' => 'nullable|string|max:1000',
        ], [
            'collaborator_id.exists' => 'El colaborador seleccionado no pertenece a esta empresa.',
        ]);

        Collaborator::query()
            ->where('company_id', $companyId)
            ->findOrFail($validated['collaborator_id']);
        $totals = $this->receiptSyncService->calculateTotals(
            $companyId,
            (int) $validated['collaborator_id'],
            $validated['period_from'],
            $validated['period_to'],
        );

        $receipt = CollaboratorReceipt::create([
            'company_id' => $companyId,
            'collaborator_id' => $validated['collaborator_id'],
            'created_by' => $request->user()->id,
            'period_from' => $validated['period_from'],
            'period_to' => $validated['period_to'],
            'days_worked' => $totals['days_worked'],
            'hours' => $totals['hours'],
            'gross' => $totals['gross'],
            'extras_total' => $totals['extras_total'],
            'discounts_total' => $totals['discounts_total'],
            'net' => $totals['net'],
            'status' => 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('collaborator-receipts.show', $receipt->id)
            ->with('success', 'Recibo generado exitosamente.');
    }

    public function show(CollaboratorReceipt $collaboratorReceipt): \Inertia\Response
    {
        $this->ensureCompanyOwned($collaboratorReceipt, auth()->user()->company_id ?? 1);
        $collaboratorReceipt = $this->receiptSyncService->syncReceipt($collaboratorReceipt);

        $collaboratorReceipt->load('collaborator.company');
        $companyId = $collaboratorReceipt->company_id;

        $extras = CollaboratorExtra::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $collaboratorReceipt->collaborator_id)
            ->whereBetween('date', [$collaboratorReceipt->period_from, $collaboratorReceipt->period_to])
            ->orderBy('date')
            ->get();

        $discounts = CollaboratorDiscount::query()
            ->where('company_id', $companyId)
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

    public function update(Request $request, CollaboratorReceipt $collaboratorReceipt): \Illuminate\Http\RedirectResponse
    {
        $this->ensureCompanyOwned($collaboratorReceipt, $request->user()->company_id ?? 1);
        $collaboratorReceipt = $this->receiptSyncService->syncReceipt($collaboratorReceipt);

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
        $this->ensureCompanyOwned($collaboratorReceipt, auth()->user()->company_id ?? 1);

        $collaboratorReceipt->delete();

        return redirect()->route('collaborator-receipts.index')->with('success', 'Recibo eliminado.');
    }

    private function ensureCompanyOwned(CollaboratorReceipt $collaboratorReceipt, int $companyId): void
    {
        abort_unless((int) $collaboratorReceipt->company_id === $companyId, 404);
    }
}
