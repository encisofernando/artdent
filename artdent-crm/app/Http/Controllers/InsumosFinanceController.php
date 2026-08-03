<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\EcommerceOrder;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\IncomeRecord;
use App\Models\PaymentMethod;
use App\Models\Sale;
use App\Models\VendorPayment;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Ingresos y egresos de Insumos: cruza en una sola pantalla los ingresos
 * manuales (IncomeRecord scope='insumos') + ventas (Sale + EcommerceOrder,
 * mismo criterio que usa el Dashboard) como ingreso automático, y los
 * egresos manuales (Expense scope='insumos') + pagos a proveedores
 * (VendorPayment) como egreso automático — mismo patrón que
 * LabFinanceController fusiona pagos de odontólogos/colaboradores para
 * Laboratorio. Las filas automáticas no se pueden borrar/editar acá: esa
 * lógica vive en sus pantallas propias (Control de Ventas, Pagos a
 * Proveedores) para no duplicar side-effects (stock, cuenta corriente).
 */
class InsumosFinanceController extends Controller
{
    private const SCOPE = 'insumos';

    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $search = trim((string) $request->input('search', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        [$start, $end] = $this->resolveDateRange($from, $to);

        $manualIncomes = IncomeRecord::query()
            ->with(['paymentMethod'])
            ->where('company_id', $companyId)
            ->where('scope', self::SCOPE)
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

        $manualExpenses = Expense::query()
            ->with(['expense_category', 'payment_method'])
            ->where('company_id', $companyId)
            ->where('scope', self::SCOPE)
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

        $posSales = Sale::query()
            ->with('customer:id,name')
            ->where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($search !== '', fn ($query) => $query->where('sale_number', 'like', "%{$search}%"))
            ->orderByDesc('sold_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Sale $item) => [
                'id' => "sale-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'sale',
                'flow' => 'income',
                'category' => 'Venta POS',
                'date' => optional($item->sold_at)->toDateString(),
                'description' => "Venta {$item->sale_number}",
                'party' => $item->customer?->name,
                'payment_method' => null,
                'amount' => (float) $item->total,
                'notes' => null,
                'route' => route('sales.show', $item->id),
                'can_delete' => false,
            ]);

        $ecommerceSales = EcommerceOrder::query()
            ->with('customer:id,name')
            ->where('company_id', $companyId)
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($search !== '', fn ($query) => $query->where('order_number', 'like', "%{$search}%"))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (EcommerceOrder $item) => [
                'id' => "ecommerce-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'ecommerce_order',
                'flow' => 'income',
                'category' => 'Venta online',
                'date' => optional($item->created_at)->toDateString(),
                'description' => "Pedido {$item->order_number}",
                'party' => $item->customer?->name ?: $item->shipping_name,
                'payment_method' => null,
                'amount' => (float) $item->total,
                'notes' => null,
                'route' => route('ecommerce-orders.show', $item->id),
                'can_delete' => false,
            ]);

        $vendorPayments = VendorPayment::query()
            ->with(['vendor', 'paymentMethod'])
            ->where('company_id', $companyId)
            ->whereBetween('payment_date', [$start->copy()->startOfDay(), $end->copy()->endOfDay()])
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($inner) use ($search) {
                    $inner->where('reference_no', 'like', "%{$search}%")
                        ->orWhereHas('vendor', fn ($v) => $v->where('name', 'like', "%{$search}%"));
                });
            })
            ->orderByDesc('payment_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (VendorPayment $item) => [
                'id' => "vendor-payment-{$item->id}",
                'source_id' => $item->id,
                'source_type' => 'vendor_payment',
                'flow' => 'expense',
                'category' => 'Pago a proveedor',
                'date' => optional($item->payment_date)->toDateString(),
                'description' => $item->reference_no ?: 'Pago a proveedor',
                'party' => $item->vendor?->name,
                'payment_method' => $item->paymentMethod?->name,
                'amount' => (float) $item->amount,
                'notes' => null,
                'route' => route('proveedores.pagos.index'),
                'can_delete' => false,
            ]);

        $items = $manualIncomes
            ->concat($posSales)
            ->concat($ecommerceSales)
            ->concat($manualExpenses)
            ->concat($vendorPayments)
            ->sortByDesc(fn (array $item) => sprintf('%s-%06d', $item['date'] ?? '0000-00-00', $item['source_id']))
            ->values();

        $summary = [
            'income_total' => round($items->where('flow', 'income')->sum('amount'), 2),
            'expense_total' => round($items->where('flow', 'expense')->sum('amount'), 2),
            'net_total' => round($items->where('flow', 'income')->sum('amount') - $items->where('flow', 'expense')->sum('amount'), 2),
            'income_count' => $items->where('flow', 'income')->count(),
            'expense_count' => $items->where('flow', 'expense')->count(),
        ];

        return Inertia::render('InsumosFinance/Index', [
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
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'income_date' => 'required|date',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        IncomeRecord::create([
            'company_id' => $companyId,
            'scope' => self::SCOPE,
            'user_id' => $request->user()->id,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'income_date' => $validated['income_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('insumos-finance.index', $this->forwardFilters($request))
            ->with('success', 'Ingreso registrado correctamente.');
    }

    public function storeExpense(Request $request): RedirectResponse
    {
        $companyId = CompanyContext::id();

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
            'scope' => self::SCOPE,
            'user_id' => $request->user()->id,
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'expense_category_id' => $validated['expense_category_id'] ?? null,
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'reference' => $validated['reference'] ?? null,
            'expense_date' => $validated['expense_date'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('insumos-finance.index', $this->forwardFilters($request))
            ->with('success', 'Egreso registrado correctamente.');
    }

    public function destroyIncome(Request $request, IncomeRecord $incomeRecord): RedirectResponse
    {
        $this->authorizeInsumosRecord((int) $incomeRecord->company_id);
        $incomeRecord->delete();

        return redirect()->route('insumos-finance.index', $this->forwardFilters($request))
            ->with('success', 'Ingreso eliminado.');
    }

    public function destroyExpense(Request $request, Expense $expense): RedirectResponse
    {
        $this->authorizeInsumosRecord((int) $expense->company_id);
        $expense->delete();

        return redirect()->route('insumos-finance.index', $this->forwardFilters($request))
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

    private function authorizeInsumosRecord(int $companyId): void
    {
        if (CompanyContext::id() !== $companyId) {
            abort(403);
        }
    }
}
