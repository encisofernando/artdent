<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\Expense;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class ReportesController extends Controller
{
    public function index(): InertiaResponse
    {
        return Inertia::render('Reportes/Index');
    }

    public function exportPdf(Request $request): Response
    {
        $period = $request->input('period', 'month');
        $companyId = auth()->user()->company_id ?? 1;

        [$start, $end, $prevStart, $prevEnd] = $this->periodRanges($period);

        // ── Revenue (POS + Ecommerce) ─────────────────────────────────────────
        $posRevenue = (float) Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$start, $end])
            ->sum('total');

        $posCount = Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$start, $end])
            ->count();

        $ecoRevenue = (float) EcommerceOrder::where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->sum('total');

        $ecoCount = EcommerceOrder::where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->count();

        $revenue = $posRevenue + $ecoRevenue;
        $totalSales = $posCount + $ecoCount;
        $avgTicket = $totalSales > 0 ? round($revenue / $totalSales, 2) : 0.0;
        $newCustomers = Customer::whereBetween('created_at', [$start, $end])->count();

        // ── Expenses & cashflow ───────────────────────────────────────────────
        $expenses = (float) Expense::where('company_id', $companyId)
            ->whereBetween('expense_date', [$start, $end])
            ->sum('amount');

        $cashFlow = $revenue - $expenses;

        // ── Cobros pendientes ─────────────────────────────────────────────────
        $pendingCollections = (float) Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereRaw('COALESCE(total, 0) > COALESCE(paid_amount, 0)')
            ->sum(DB::raw('COALESCE(total, 0) - COALESCE(paid_amount, 0)'));

        // ── Previous period ───────────────────────────────────────────────────
        $prevRevenue = (float) Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$prevStart, $prevEnd])
            ->sum('total')
            + (float) EcommerceOrder::where('payment_status', 'paid')
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->sum('total');

        $prevTotalSales = Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$prevStart, $prevEnd])
            ->count()
            + EcommerceOrder::where('payment_status', 'paid')
                ->whereBetween('created_at', [$prevStart, $prevEnd])
                ->count();

        $prevAvgTicket = $prevTotalSales > 0 ? round($prevRevenue / $prevTotalSales, 2) : 0.0;
        $prevNewCustomers = Customer::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $prevExpenses = (float) Expense::where('company_id', $companyId)
            ->whereBetween('expense_date', [$prevStart, $prevEnd])
            ->sum('amount');
        $prevCashFlow = $prevRevenue - $prevExpenses;

        // ── Top products ──────────────────────────────────────────────────────
        $topProducts = SaleItem::select(
            'product_name',
            DB::raw('SUM(quantity) as qty_sold'),
            DB::raw('SUM(total) as revenue')
        )
            ->whereHas('sale', fn ($q) => $q
                ->where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('sold_at', [$start, $end])
            )
            ->groupBy('product_name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->product_name,
                'qty' => (float) $row->qty_sold,
                'revenue' => (float) $row->revenue,
            ])
            ->toArray();

        // ── Top customers ─────────────────────────────────────────────────────
        $topCustomers = Sale::select(
            'customer_id',
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(*) as orders')
        )
            ->where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$start, $end])
            ->whereNotNull('customer_id')
            ->with('customer:id,name')
            ->groupBy('customer_id')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'name' => $row->customer?->name ?? '—',
                'revenue' => (float) $row->revenue,
                'orders' => (int) $row->orders,
            ])
            ->toArray();

        // ── Low stock alerts ──────────────────────────────────────────────────
        $lowStock = Stock::with('product:id,name,sku')
            ->whereHas('product', fn ($q) => $q
                ->where('company_id', $companyId)
                ->where('track_stock', true)
                ->where('is_active', true)
            )
            ->whereRaw('quantity <= min_quantity AND min_quantity > 0')
            ->orderBy('quantity')
            ->limit(5)
            ->get()
            ->map(fn ($s) => [
                'name' => $s->product?->name ?? '—',
                'sku' => $s->product?->sku ?? '',
                'quantity' => (float) $s->quantity,
                'min' => (float) $s->min_quantity,
            ])
            ->toArray();

        // ── Gastos por categoría ──────────────────────────────────────────────
        $expensesByCategory = Expense::select(
            DB::raw('COALESCE(expense_categories.name, "Sin categoría") as cat_name'),
            DB::raw('SUM(expenses.amount) as total')
        )
            ->leftJoin('expense_categories', 'expenses.expense_category_id', '=', 'expense_categories.id')
            ->where('expenses.company_id', $companyId)
            ->whereBetween('expenses.expense_date', [$start, $end])
            ->groupBy('expense_categories.name')
            ->orderByDesc('total')
            ->limit(6)
            ->get()
            ->map(fn ($row) => [
                'category' => $row->cat_name,
                'total' => (float) $row->total,
            ])
            ->toArray();

        $stats = [
            'current' => [
                'total_sales' => $totalSales,
                'revenue' => $revenue,
                'new_customers' => $newCustomers,
                'avg_ticket' => $avgTicket,
                'expenses' => $expenses,
                'cashflow' => $cashFlow,
                'pending_collections' => $pendingCollections,
                'pos_revenue' => $posRevenue,
                'pos_count' => $posCount,
                'eco_revenue' => $ecoRevenue,
                'eco_count' => $ecoCount,
            ],
            'trends' => [
                'sales' => $this->trendPct($totalSales, $prevTotalSales),
                'revenue' => $this->trendPct($revenue, $prevRevenue),
                'customers' => $this->trendPct($newCustomers, $prevNewCustomers),
                'avg_ticket' => $this->trendPct($avgTicket, $prevAvgTicket),
                'expenses' => $this->trendPct($expenses, $prevExpenses),
                'cashflow' => $this->trendPct($cashFlow, $prevCashFlow),
            ],
        ];

        $chartData = $this->buildChartData($period, $start, $end, $companyId);
        $transactions = $this->buildRecentTransactions($start, $end, $companyId);
        $company = Company::find($companyId) ?? new Company(['name' => 'ArtDent']);

        $periodLabels = [
            'today' => 'Hoy · '.now()->format('d/m/Y'),
            'week' => 'Semana actual · '.$start->format('d/m').' al '.$end->format('d/m/Y'),
            'month' => $start->translatedFormat('F Y'),
            'year' => $start->format('Y'),
        ];

        $pdf = Pdf::loadView('pdf.dashboard_report', [
            'stats' => $stats,
            'chartData' => $chartData,
            'transactions' => $transactions,
            'topProducts' => $topProducts,
            'topCustomers' => $topCustomers,
            'lowStock' => $lowStock,
            'expensesByCategory' => $expensesByCategory,
            'company' => $company,
            'periodLabel' => $periodLabels[$period] ?? $period,
            'periodKey' => $period,
            'userName' => auth()->user()->name ?? 'Sistema',
        ])->setPaper('a4', 'portrait');

        $filename = 'reporte-artdent-'.$period.'-'.now()->format('Ymd').'.pdf';

        return $pdf->download($filename);
    }

    /** @return array{Carbon, Carbon, Carbon, Carbon} */
    private function periodRanges(string $period): array
    {
        $now = Carbon::now();

        return match ($period) {
            'today' => [
                $now->copy()->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDay()->startOfDay(),
                $now->copy()->subDay()->endOfDay(),
            ],
            'week' => [
                $now->copy()->startOfWeek(CarbonInterface::MONDAY),
                $now->copy()->endOfWeek(CarbonInterface::SUNDAY),
                $now->copy()->subWeek()->startOfWeek(CarbonInterface::MONDAY),
                $now->copy()->subWeek()->endOfWeek(CarbonInterface::SUNDAY),
            ],
            'year' => [
                $now->copy()->startOfYear(),
                $now->copy()->endOfDay(),
                $now->copy()->subYear()->startOfYear(),
                $now->copy()->subYear()->endOfYear(),
            ],
            default => [
                $now->copy()->startOfMonth(),
                $now->copy()->endOfDay(),
                $now->copy()->subMonth()->startOfMonth(),
                $now->copy()->subMonth()->endOfMonth(),
            ],
        };
    }

    private function trendPct(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    /** @return array<int, array<string, mixed>> */
    private function buildChartData(string $period, Carbon $start, Carbon $end, int $companyId): array
    {
        if ($period === 'today') {
            $points = [];
            $cursor = $start->copy()->startOfHour();
            while ($cursor->lte($end)) {
                $hStart = $cursor->copy();
                $hEnd = $cursor->copy()->endOfHour();
                $posR = (float) Sale::where('company_id', $companyId)->where('status', '!=', 'cancelled')->whereBetween('sold_at', [$hStart, $hEnd])->sum('total');
                $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')->whereBetween('created_at', [$hStart, $hEnd])->sum('total');
                $exp = (float) Expense::where('company_id', $companyId)->whereBetween('expense_date', [$hStart, $hEnd])->sum('amount');
                $points[] = ['label' => $cursor->format('H:00'), 'revenue' => round($posR + $ecoR, 2), 'expenses' => round($exp, 2)];
                $cursor->addHour();
            }

            return $points;
        }

        if ($period === 'year') {
            $points = [];
            $cursor = $start->copy()->startOfMonth();
            while ($cursor->lte($end)) {
                $mStart = $cursor->copy()->startOfMonth();
                $mEnd = $cursor->copy()->endOfMonth();
                $posR = (float) Sale::where('company_id', $companyId)->where('status', '!=', 'cancelled')->whereBetween('sold_at', [$mStart, $mEnd])->sum('total');
                $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')->whereBetween('created_at', [$mStart, $mEnd])->sum('total');
                $exp = (float) Expense::where('company_id', $companyId)->whereBetween('expense_date', [$mStart, $mEnd])->sum('amount');
                $points[] = ['label' => $cursor->translatedFormat('M'), 'revenue' => round($posR + $ecoR, 2), 'expenses' => round($exp, 2)];
                $cursor->addMonth();
            }

            return $points;
        }

        $points = [];
        $cursor = $start->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $dStart = $cursor->copy()->startOfDay();
            $dEnd = $cursor->copy()->endOfDay();
            $posR = (float) Sale::where('company_id', $companyId)->where('status', '!=', 'cancelled')->whereBetween('sold_at', [$dStart, $dEnd])->sum('total');
            $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')->whereBetween('created_at', [$dStart, $dEnd])->sum('total');
            $exp = (float) Expense::where('company_id', $companyId)->whereBetween('expense_date', [$dStart, $dEnd])->sum('amount');
            $points[] = ['label' => $cursor->format('d/m'), 'revenue' => round($posR + $ecoR, 2), 'expenses' => round($exp, 2)];
            $cursor->addDay();
        }

        return $points;
    }

    /** @return array<int, array<string, mixed>> */
    private function buildRecentTransactions(Carbon $start, Carbon $end, int $companyId): array
    {
        $posSales = Sale::with('customer')
            ->where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$start, $end])
            ->orderByDesc('sold_at')
            ->limit(10)
            ->get()
            ->map(fn ($s) => [
                'txId' => $s->sale_number,
                'user' => $s->customer?->name ?? 'Consumidor Final',
                'cost' => (float) $s->total,
                'paid' => (float) ($s->paid_amount ?? $s->total),
                'date' => Carbon::parse($s->sold_at)->format('d/m/Y'),
                'source' => 'pos',
                'status' => $s->status,
            ]);

        $ecoOrders = EcommerceOrder::with('customer')
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'txId' => $o->order_number,
                'user' => $o->customer?->name ?? $o->shipping_name ?? 'Cliente',
                'cost' => (float) $o->total,
                'paid' => (float) $o->total,
                'date' => Carbon::parse($o->created_at)->format('d/m/Y'),
                'source' => 'ecommerce',
                'status' => 'paid',
            ]);

        return $posSales
            ->concat($ecoOrders)
            ->sortByDesc('date')
            ->take(20)
            ->values()
            ->toArray();
    }
}
