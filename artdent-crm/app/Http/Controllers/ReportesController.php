<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\Sale;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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

        // ── Current ───────────────────────────────────────────────────────────
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

        // ── Previous ──────────────────────────────────────────────────────────
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

        $stats = [
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
        ];

        $chartData = $this->buildChartData($period, $start, $end, $companyId);
        $transactions = $this->buildRecentTransactions($start, $end, $companyId);
        $company = Company::find($companyId) ?? new Company(['name' => 'ArtDent']);

        $periodLabels = [
            'today' => 'Hoy · '.now()->format('d/m/Y'),
            'week' => 'Últimos 7 días · '.$start->format('d/m').' al '.$end->format('d/m/Y'),
            'month' => $start->translatedFormat('F Y'),
            'year' => $start->format('Y'),
        ];

        $pdf = Pdf::loadView('pdf.dashboard_report', [
            'stats' => $stats,
            'chartData' => $chartData,
            'transactions' => $transactions,
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
            ->take(30)
            ->values()
            ->toArray();
    }
}
