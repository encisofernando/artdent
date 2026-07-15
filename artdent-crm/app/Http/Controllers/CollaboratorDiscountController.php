<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorDiscount;
use App\Services\CollaboratorReceiptSyncService;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CollaboratorDiscountController extends Controller
{
    public function __construct(private readonly CollaboratorReceiptSyncService $receiptSyncService) {}

    public function index(Request $request): \Inertia\Response
    {
        $companyId = CompanyContext::id();
        $collaboratorId = $request->input('collaborator_id');
        $search = trim((string) $request->input('search', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        $query = CollaboratorDiscount::query()
            ->with('collaborator')
            ->where('company_id', $companyId);

        if ($collaboratorId) {
            $query->where('collaborator_id', $collaboratorId);
        }

        if ($search !== '') {
            $query->where('concept', 'like', "%{$search}%");
        }

        if ($from) {
            $query->where('date', '>=', $from);
        }

        if ($to) {
            $query->where('date', '<=', $to);
        }

        $summaryQuery = clone $query;
        $items = $query
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $collaborators = Collaborator::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CollaboratorDiscount/Index', [
            'items' => $items,
            'collaborators' => $collaborators,
            'filters' => [
                'collaborator_id' => $collaboratorId,
                'search' => $search,
                'from' => $from,
                'to' => $to,
            ],
            'summary' => [
                'records' => (clone $summaryQuery)->count(),
                'collaborators' => (clone $summaryQuery)->distinct()->count('collaborator_id'),
                'amount' => round((float) ((clone $summaryQuery)->sum('amount') ?? 0), 2),
            ],
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'collaborator_id' => [
                'required',
                Rule::exists('collaborators', 'id')->where(fn ($query) => $query->where('company_id', $companyId)),
            ],
            'date' => 'required|date',
            'concept' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ], [
            'collaborator_id.exists' => 'El colaborador seleccionado no pertenece a esta empresa.',
        ]);

        CollaboratorDiscount::create([
            'company_id' => $companyId,
            'collaborator_id' => $validated['collaborator_id'],
            'date' => $validated['date'],
            'concept' => $validated['concept'],
            'amount' => $validated['amount'],
        ]);

        $this->receiptSyncService->syncDraftReceiptsForDate(
            $companyId,
            (int) $validated['collaborator_id'],
            $validated['date'],
        );

        return back()->with('success', 'Descuento registrado.');
    }

    public function update(Request $request, CollaboratorDiscount $collaboratorDiscount): \Illuminate\Http\RedirectResponse
    {
        $this->ensureCompanyOwned($collaboratorDiscount, CompanyContext::id());
        $originalDate = $collaboratorDiscount->date->toDateString();
        $collaboratorId = (int) $collaboratorDiscount->collaborator_id;
        $companyId = (int) $collaboratorDiscount->company_id;

        $validated = $request->validate([
            'date' => 'required|date',
            'concept' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
        ]);

        $collaboratorDiscount->update($validated);
        $this->receiptSyncService->syncDraftReceiptsForDate($companyId, $collaboratorId, $originalDate);
        if ($validated['date'] !== $originalDate) {
            $this->receiptSyncService->syncDraftReceiptsForDate($companyId, $collaboratorId, $validated['date']);
        }

        return back()->with('success', 'Descuento actualizado.');
    }

    public function destroy(CollaboratorDiscount $collaboratorDiscount): \Illuminate\Http\RedirectResponse
    {
        $this->ensureCompanyOwned($collaboratorDiscount, CompanyContext::id());
        $companyId = (int) $collaboratorDiscount->company_id;
        $collaboratorId = (int) $collaboratorDiscount->collaborator_id;
        $date = $collaboratorDiscount->date->toDateString();

        $collaboratorDiscount->delete();
        $this->receiptSyncService->syncDraftReceiptsForDate($companyId, $collaboratorId, $date);

        return back()->with('success', 'Descuento eliminado.');
    }

    private function ensureCompanyOwned(CollaboratorDiscount $collaboratorDiscount, int $companyId): void
    {
        abort_unless((int) $collaboratorDiscount->company_id === $companyId, 404);
    }
}
