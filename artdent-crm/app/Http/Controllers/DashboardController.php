<?php

namespace App\Http\Controllers;

use App\Models\ChatbotMessage;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\EcommerceOrderItem;
use App\Models\Expense;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\Stock;
use App\Models\User;
use App\Models\VendorPayment;
use App\Support\CompanyContext;
use App\Support\PeriodRangeResolver;
use App\Support\TenantModuleResolver;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'month');
        $referenceDate = $request->input('reference_date');
        $companyId = CompanyContext::id();

        [$start, $end, $prevStart, $prevEnd] = PeriodRangeResolver::resolve($period, $referenceDate);

        // ── Revenue (POS + Ecommerce) ──────────────────────────────────────────
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

        // ── Expenses (Gestión only, exclude lab scope) + pagos a proveedores ───
        $expenses = $this->expensesFor($companyId, $start, $end);

        // ── Cash flow ─────────────────────────────────────────────────────────
        $cashFlow = $revenue - $expenses;

        // ── Cobros pendientes (ventas en cuenta corriente sin cobrar) ─────────
        $pendingCollections = (float) Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereRaw('COALESCE(total, 0) > COALESCE(paid_amount, 0)')
            ->sum(DB::raw('COALESCE(total, 0) - COALESCE(paid_amount, 0)'));

        // ── Previous period ───────────────────────────────────────────────────
        $prevPosRevenue = (float) Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$prevStart, $prevEnd])
            ->sum('total');

        $prevPosCount = Sale::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('sold_at', [$prevStart, $prevEnd])
            ->count();

        $prevEcoRevenue = (float) EcommerceOrder::where('payment_status', 'paid')
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->sum('total');

        $prevEcoCount = EcommerceOrder::where('payment_status', 'paid')
            ->whereBetween('created_at', [$prevStart, $prevEnd])
            ->count();

        $prevRevenue = $prevPosRevenue + $prevEcoRevenue;
        $prevTotalSales = $prevPosCount + $prevEcoCount;
        $prevAvgTicket = $prevTotalSales > 0 ? round($prevRevenue / $prevTotalSales, 2) : 0.0;
        $prevNewCustomers = Customer::whereBetween('created_at', [$prevStart, $prevEnd])->count();
        $prevExpenses = $this->expensesFor($companyId, $prevStart, $prevEnd);
        $prevCashFlow = $prevRevenue - $prevExpenses;

        // ── Top products (POS + e-commerce combinados) ─────────────────────────
        $posTopProducts = SaleItem::select(
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
            ->get();

        $ecoTopProducts = EcommerceOrderItem::select(
            'product_name',
            DB::raw('SUM(quantity) as qty_sold'),
            DB::raw('SUM(total) as revenue')
        )
            ->whereHas('ecommerce_order', fn ($q) => $q
                ->where('payment_status', 'paid')
                ->whereBetween('created_at', [$start, $end])
            )
            ->groupBy('product_name')
            ->get();

        // Mismo catálogo de productos entre POS y e-commerce — se combinan por
        // nombre para que un producto vendido en los dos canales aparezca una
        // sola vez con el total real, en vez de ignorar el canal e-commerce
        // por completo (como hacía antes, ver auditoría).
        $topProducts = $posTopProducts->concat($ecoTopProducts)
            ->groupBy('product_name')
            ->map(fn ($rows, $name) => [
                'name' => $name,
                'qty' => (float) $rows->sum('qty_sold'),
                'revenue' => (float) $rows->sum('revenue'),
            ])
            ->sortByDesc('revenue')
            ->take(5)
            ->values()
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

        return Inertia::render('Dashboard', [
            'stats' => [
                'current' => [
                    'total_sales' => $totalSales,
                    'revenue' => $revenue,
                    'new_customers' => $newCustomers,
                    'avg_ticket' => $avgTicket,
                    'expenses' => $expenses,
                    'cashflow' => $cashFlow,
                    'pending_collections' => $pendingCollections,
                ],
                'trends' => [
                    'sales' => $this->trendPct($totalSales, $prevTotalSales),
                    'revenue' => $this->trendPct($revenue, $prevRevenue),
                    'customers' => $this->trendPct($newCustomers, $prevNewCustomers),
                    'avg_ticket' => $this->trendPct($avgTicket, $prevAvgTicket),
                    'expenses' => $this->trendPct($expenses, $prevExpenses),
                    'cashflow' => $this->trendPct($cashFlow, $prevCashFlow),
                ],
            ],
            'chartData' => $this->buildChartData($period, $start, $end, $companyId),
            'recentTransactions' => $this->buildRecentTransactions($start, $end, $companyId),
            'topProducts' => $topProducts,
            'topCustomers' => $topCustomers,
            'lowStock' => $lowStock,
            'period' => $period,
            'referenceDate' => $start->toDateString(),
            'periodStart' => $start->toDateString(),
            'periodEnd' => $end->toDateString(),
            'planUsage' => $this->buildPlanUsage(),
        ]);
    }

    /** @return array{plan: string, items: array<int, array<string, mixed>>}|null */
    private function buildPlanUsage(): ?array
    {
        $modules = app(TenantModuleResolver::class);
        $plan = $modules->currentPlan();

        if (! $plan) {
            return null;
        }

        // withoutCompanyScope(): el uso de plan es por tenant completo
        // (modo owner), no por una sola empresa — mismo criterio que
        // App\Support\PlanLimitService, que es quien realmente lo aplica.
        $items = [
            ['label' => 'Usuarios', 'current' => User::count(), 'max' => $plan->max_users],
            ['label' => 'Productos', 'current' => Product::withoutCompanyScope()->count(), 'max' => $plan->max_products],
            [
                'label' => 'Ventas este mes',
                'current' => Sale::withoutCompanyScope()->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count(),
                'max' => $plan->max_sales_per_month,
            ],
        ];

        if ($modules->has('chat_ia') && Schema::hasTable('chatbot_messages')) {
            $items[] = [
                'label' => 'Mensajes Chat IA este mes',
                'current' => ChatbotMessage::where('role', 'user')
                    ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
                    ->count(),
                'max' => $plan->max_chat_messages_per_month,
            ];
        }

        return [
            'plan' => $plan->name,
            'items' => $items,
        ];
    }

    private function trendPct(float $current, float $previous): float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round(($current - $previous) / $previous * 100, 1);
    }

    /**
     * Gastos operativos (Expense, excluye scope 'lab') + pagos a proveedores
     * (VendorPayment, plata que realmente salió de caja) — las compras a
     * insumos/proveedores nunca escriben en `expenses`, viven aparte en la
     * cuenta corriente del proveedor, por eso se suman acá explícitamente.
     */
    private function expensesFor(int $companyId, $start, $end): float
    {
        $opExpenses = (float) Expense::where('company_id', $companyId)
            ->where(fn ($q) => $q->whereNull('scope')->orWhere('scope', '!=', 'lab'))
            ->whereBetween('expense_date', [$start, $end])
            ->sum('amount');

        $vendorPayments = (float) VendorPayment::where('company_id', $companyId)
            ->whereBetween('payment_date', [$start, $end])
            ->sum('amount');

        return $opExpenses + $vendorPayments;
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

                $posR = (float) Sale::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('sold_at', [$hStart, $hEnd])
                    ->sum('total');

                $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')
                    ->whereBetween('created_at', [$hStart, $hEnd])
                    ->sum('total');

                $exp = $this->expensesFor($companyId, $hStart, $hEnd);

                $points[] = [
                    'label' => $cursor->format('H:00'),
                    'revenue' => round($posR + $ecoR, 2),
                    'expenses' => round($exp, 2),
                ];
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

                $posR = (float) Sale::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('sold_at', [$mStart, $mEnd])
                    ->sum('total');

                $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')
                    ->whereBetween('created_at', [$mStart, $mEnd])
                    ->sum('total');

                $exp = $this->expensesFor($companyId, $mStart, $mEnd);

                $points[] = [
                    'label' => $cursor->translatedFormat('M'),
                    'revenue' => round($posR + $ecoR, 2),
                    'expenses' => round($exp, 2),
                ];
                $cursor->addMonth();
            }

            return $points;
        }

        // Daily (week / month)
        $points = [];
        $cursor = $start->copy()->startOfDay();

        while ($cursor->lte($end)) {
            $dStart = $cursor->copy()->startOfDay();
            $dEnd = $cursor->copy()->endOfDay();

            $posR = (float) Sale::where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('sold_at', [$dStart, $dEnd])
                ->sum('total');

            $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')
                ->whereBetween('created_at', [$dStart, $dEnd])
                ->sum('total');

            $exp = $this->expensesFor($companyId, $dStart, $dEnd);

            $points[] = [
                'label' => $cursor->format('d/m'),
                'revenue' => round($posR + $ecoR, 2),
                'expenses' => round($exp, 2),
            ];
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
            ->limit(15)
            ->get()
            ->map(fn ($s) => [
                'txId' => $s->sale_number,
                'user' => $s->customer?->name ?? 'Consumidor Final',
                'cost' => (float) $s->total,
                'date' => Carbon::parse($s->sold_at)->format('d/m/Y H:i'),
                'source' => 'pos',
            ]);

        $ecoOrders = EcommerceOrder::with('customer')
            ->where('payment_status', 'paid')
            ->whereBetween('created_at', [$start, $end])
            ->orderByDesc('created_at')
            ->limit(15)
            ->get()
            ->map(fn ($o) => [
                'txId' => $o->order_number,
                'user' => $o->customer?->name ?? $o->shipping_name ?? 'Cliente',
                'cost' => (float) $o->total,
                'date' => Carbon::parse($o->created_at)->format('d/m/Y H:i'),
                'source' => 'ecommerce',
            ]);

        return $posSales
            ->concat($ecoOrders)
            ->sortByDesc('date')
            ->take(20)
            ->values()
            ->toArray();
    }
}
