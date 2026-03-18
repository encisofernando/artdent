<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->input('period', 'month');
        $companyId = auth()->user()->company_id ?? 1;

        [$start, $end, $prevStart, $prevEnd] = $this->periodRanges($period);

        // ── Current period ────────────────────────────────────────────────────
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

        // ── Previous period (for trends) ──────────────────────────────────────
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

        return Inertia::render('Dashboard', [
            'stats' => [
                'current' => [
                    'total_sales' => $totalSales,
                    'revenue' => $revenue,
                    'new_customers' => $newCustomers,
                    'avg_ticket' => $avgTicket,
                ],
                'trends' => [
                    'sales' => $this->trendPct($totalSales, $prevTotalSales),
                    'revenue' => $this->trendPct($revenue, $prevRevenue),
                    'customers' => $this->trendPct($newCustomers, $prevNewCustomers),
                    'avg_ticket' => $this->trendPct($avgTicket, $prevAvgTicket),
                ],
            ],
            'chartData' => $this->buildChartData($period, $start, $end, $companyId),
            'recentTransactions' => $this->buildRecentTransactions($start, $end, $companyId),
            'period' => $period,
        ]);
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
                $now->copy()->subDays(6)->startOfDay(),
                $now->copy()->endOfDay(),
                $now->copy()->subDays(13)->startOfDay(),
                $now->copy()->subDays(7)->endOfDay(),
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

                $posR = (float) Sale::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('sold_at', [$hStart, $hEnd])
                    ->sum('total');

                $ecoR = (float) EcommerceOrder::where('payment_status', 'paid')
                    ->whereBetween('created_at', [$hStart, $hEnd])
                    ->sum('total');

                $points[] = ['label' => $cursor->format('H:00'), 'revenue' => round($posR + $ecoR, 2)];
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

                $points[] = ['label' => $cursor->translatedFormat('M'), 'revenue' => round($posR + $ecoR, 2)];
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

            $points[] = ['label' => $cursor->format('d/m'), 'revenue' => round($posR + $ecoR, 2)];
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
