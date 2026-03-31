<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\CollaboratorReceipt;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\IncomeRecord;
use App\Models\LabAccountMove;
use App\Models\PaymentMethod;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class LabFinanceController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $search = trim((string) $request->input('search', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        [$start, $end] = $this->resolveDateRange($from, $to);

        $manualIncomes = IncomeRecord::query()
            ->with(['paymentMethod'])
            ->where('company_id', $companyId)
            ->where('scope', 'lab')
            ->whereBetween('income_date', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($search !== '', fn ($query) => $query->where('description', 'like', "%{$search}%"))
            ->orderByDesc('income_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (IncomeRecord $item) => [
                'id' => "income-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'income_record',
                'flow' => 'income',
                'category' => 'Ingreso manual',
                'date' => optional($item->income_date)->toDateString(),
                'description' => $item->description,
                'party' => null,
                'payment_method' => $item->paymentMethod?->name,
                'amount' => (float) $item->amount,
                'notes' => $item->notes,
                'route' => null,
                'can_delete' => true,
            ]);

        $jobPayments = LabAccountMove::query()
            ->with(['account.dentist', 'paymentMethod'])
            ->whereHas('account.dentist', fn ($query) => $query->where('company_id', $companyId))
            ->where('type', LabAccountMove::TYPE_PAYMENT)
            ->whereBetween('move_date', [$start->toDateString(), $end->toDateString()])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('description', 'like', "%{$search}%")
                        ->orWhereHas('account.dentist', function ($dentistQuery) use ($search) {
                            $dentistQuery->where('name', 'like', "%{$search}%")
                                ->orWhere('last_name', 'like', "%{$search}%");
                        });
                });
            })
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (LabAccountMove $item) => [
                'id' => "lab-payment-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'lab_account_payment',
                'flow' => 'income',
                'category' => 'Pago de odontologo',
                'date' => optional($item->move_date)->toDateString(),
                'description' => $item->description ?: 'Pago recibido de odontologo',
                'party' => trim(($item->account?->dentist?->name ?? '').' '.($item->account?->dentist?->last_name ?? '')) ?: null,
                'payment_method' => $item->paymentMethod?->name,
                'amount' => (float) $item->amount,
                'notes' => null,
                'route' => route('lab-account-moves.show', $item->id),
                'can_delete' => false,
            ]);

        $manualExpenses = Expense::query()
            ->with(['expense_category', 'payment_method', 'vendor'])
            ->where('company_id', $companyId)
            ->where('scope', 'lab')
            ->whereBetween('expense_date', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('description', 'like', "%{$search}%")
                        ->orWhere('reference', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('expense_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Expense $item) => [
                'id' => "expense-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'expense',
                'flow' => 'expense',
                'category' => $item->expense_category?->name ?: 'Egreso manual',
                'date' => optional($item->expense_date)->toDateString(),
                'description' => $item->description,
                'party' => null,
                'payment_method' => $item->payment_method?->name,
                'amount' => (float) $item->amount,
                'notes' => $item->notes,
                'route' => null,
                'can_delete' => true,
            ]);

        $collaboratorReceipts = CollaboratorReceipt::query()
            ->with(['collaborator', 'payment_method'])
            ->where('company_id', $companyId)
            ->where('status', 'paid')
            ->whereNotNull('paid_at')
            ->whereBetween('paid_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($search !== '', fn ($query) => $query->whereHas('collaborator', fn ($collabQuery) => $collabQuery->where('name', 'like', "%{$search}%")))
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (CollaboratorReceipt $item) => [
                'id' => "receipt-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'collaborator_receipt',
                'flow' => 'expense',
                'category' => 'Pago a colaborador',
                'date' => optional($item->paid_at)->toDateString(),
                'description' => 'Recibo pagado a colaborador',
                'party' => $item->collaborator?->name,
                'payment_method' => $item->payment_method?->name,
                'amount' => (float) $item->net,
                'notes' => $item->notes,
                'route' => route('collaborator-receipts.show', $item->id),
                'can_delete' => false,
            ]);

        $items = $manualIncomes
            ->concat($jobPayments)
            ->concat($manualExpenses)
            ->concat($collaboratorReceipts)
            ->sortByDesc(fn (array $item) => sprintf('%s-%06d', $item['date'] ?? '0000-00-00', $item['source_id']))
            ->values();

        $summary = [
            'income_total' => round($items->where('flow', 'income')->sum('amount'), 2),
            'expense_total' => round($items->where('flow', 'expense')->sum('amount'), 2),
            'net_total' => round($items->where('flow', 'income')->sum('amount') - $items->where('flow', 'expense')->sum('amount'), 2),
            'income_count' => $items->where('flow', 'income')->count(),
            'expense_count' => $items->where('flow', 'expense')->count(),
            'dentist_income_total' => round($jobPayments->sum('amount'), 2),
            'dentist_income_count' => $jobPayments->count(),
            'collaborator_expense_total' => round($collaboratorReceipts->sum('amount'), 2),
            'collaborator_expense_count' => $collaboratorReceipts->count(),
        ];

        return Inertia::render('LabFinance/Index', [
            'items' => $items,
            'summary' => $summary,
            'company' => Company::query()->find($companyId),
            'filters' => [
                'search' => $search,
                'from' => $start->toDateString(),
                'to' => $end->toDateString(),
            ],
            'paymentMethods' => PaymentMethod::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'expenseCategories' => ExpenseCategory::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function storeIncome(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'income_date' => 'required|date',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        IncomeRecord::create([
            'company_id' => $companyId,
            'scope' => 'lab',
            'user_id' => $request->user()->id,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'income_date' => $validated['income_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('lab-finance.index', $this->forwardFilters($request))
            ->with('success', 'Ingreso registrado correctamente.');
    }

    public function storeExpense(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'expense_category_id' => 'nullable|exists:expense_categories,id',
            'reference' => 'nullable|string|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        Expense::create([
            'company_id' => $companyId,
            'scope' => 'lab',
            'user_id' => $request->user()->id,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'expense_category_id' => $validated['expense_category_id'] ?? null,
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'reference' => $validated['reference'] ?? null,
            'expense_date' => $validated['expense_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('lab-finance.index', $this->forwardFilters($request))
            ->with('success', 'Egreso registrado correctamente.');
    }

    public function destroyIncome(Request $request, IncomeRecord $incomeRecord): RedirectResponse
    {
        $this->authorizeLabRecord($request, (int) $incomeRecord->company_id);
        $incomeRecord->delete();

        return redirect()->route('lab-finance.index', $this->forwardFilters($request))
            ->with('success', 'Ingreso eliminado.');
    }

    public function destroyExpense(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorizeLabRecord($request, (int) $expense->company_id);
        $expense->delete();

        return redirect()->route('lab-finance.index', $this->forwardFilters($request))
            ->with('success', 'Egreso eliminado.');
    }

    private function resolveDateRange(?string $from, ?string $to): array
    {
        $today = Carbon::today();
        $defaultFrom = $today->copy()->startOfWeek(CarbonInterface::MONDAY);
        $defaultTo = $today->copy()->endOfWeek(CarbonInterface::SUNDAY);

        $start = $this->parseDateOrFallback($from, $defaultFrom);
        $end = $this->parseDateOrFallback($to, $defaultTo);

        if ($start->gt($end)) {
            [$start, $end] = [$end, $start];
        }

        return [$start, $end];
    }

    private function parseDateOrFallback(?string $value, Carbon $fallback): Carbon
    {
        if (! $value) {
            return $fallback;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return $fallback;
        }
    }

    private function forwardFilters(Request $request): array
    {
        return array_filter([
            'search' => $request->input('search'),
            'from' => $request->input('from'),
            'to' => $request->input('to'),
        ], fn ($value) => $value !== null && $value !== '');
    }

    private function authorizeLabRecord(Request $request, int $companyId): void
    {
        if (($request->user()->company_id ?? 1) !== $companyId) {
            abort(403);
        }
    }
}
