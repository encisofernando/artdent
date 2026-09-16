<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use App\Models\SaleItem;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SalesReportController extends Controller
{
    /**
     * Reporte de ventas agrupado por período (día, mes, año).
     * Incluye comparativa con período anterior si compare=true.
     */
    public function index(Request $request): Response
    {
        $from = $request->input('from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('to', Carbon::now()->toDateString());
        $groupBy = in_array($request->input('group_by'), ['day', 'month', 'year'])
            ? $request->input('group_by')
            : 'day';
        $compare = filter_var($request->input('compare', false), FILTER_VALIDATE_BOOLEAN);

        $companyId = CompanyContext::id();

        $series = $this->buildSeries($companyId, $from, $to, $groupBy);
        $totals = $this->buildTotals($companyId, $from, $to);

        $compareSeries = [];
        $prevTotals = null;

        if ($compare) {
            [$prevFrom, $prevTo] = $this->previousPeriod($from, $to);
            $compareSeries = $this->buildSeries($companyId, $prevFrom, $prevTo, $groupBy);
            $prevTotals = $this->buildTotals($companyId, $prevFrom, $prevTo);
        }

        $topProducts = SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.company_id', $companyId)
            ->where('sales.status', '!=', 'cancelled')
            ->whereBetween(DB::raw('DATE(sales.sold_at)'), [$from, $to])
            ->whereNotNull('sale_items.product_id')
            ->groupBy('sale_items.product_id', 'sale_items.product_name', 'sale_items.sku')
            ->orderByRaw('SUM(sale_items.total) DESC')
            ->limit(10)
            ->selectRaw('
                sale_items.product_id,
                sale_items.product_name,
                sale_items.sku,
                SUM(sale_items.quantity) as total_units,
                SUM(sale_items.total) as total_revenue
            ')
            ->get();

        return Inertia::render('Reportes/VentasPorPeriodo', [
            'series' => $series,
            'compareSeries' => $compareSeries,
            'totals' => $totals,
            'prevTotals' => $prevTotals,
            'topProducts' => $topProducts,
            'filters' => [
                'from' => $from,
                'to' => $to,
                'group_by' => $groupBy,
                'compare' => $compare,
            ],
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $from = $request->input('from', Carbon::now()->startOfMonth()->toDateString());
        $to = $request->input('to', Carbon::now()->toDateString());
        $groupBy = in_array($request->input('group_by'), ['day', 'month', 'year'])
            ? $request->input('group_by')
            : 'day';

        $series = $this->buildSeries(CompanyContext::id(), $from, $to, $groupBy);
        $filename = 'ventas-por-periodo-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($series) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM UTF-8 para Excel
            fputcsv($out, ['Período', 'N° Ventas', 'Unidades', 'Subtotal', 'Descuentos', 'IVA', 'Total', 'Ticket Promedio'], ';');
            foreach ($series as $row) {
                fputcsv($out, [
                    $row['label'],
                    $row['orders'],
                    number_format($row['units'], 2, ',', '.'),
                    number_format($row['subtotal'], 2, ',', '.'),
                    number_format($row['discounts'], 2, ',', '.'),
                    number_format($row['tax'], 2, ',', '.'),
                    number_format($row['revenue'], 2, ',', '.'),
                    $row['orders'] > 0
                        ? number_format($row['revenue'] / $row['orders'], 2, ',', '.')
                        : '0,00',
                ], ';');
            }
            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private function buildSeries(int $companyId, string $from, string $to, string $groupBy): array
    {
        $fmtMap = [
            'day' => '%Y-%m-%d',
            'month' => '%Y-%m',
            'year' => '%Y',
        ];
        $fmt = $fmtMap[$groupBy];

        $rows = Sale::query()
            ->where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween(DB::raw('DATE(sold_at)'), [$from, $to])
            ->groupBy(DB::raw("DATE_FORMAT(sold_at, '{$fmt}')"))
            ->orderBy(DB::raw("DATE_FORMAT(sold_at, '{$fmt}')"))
            ->selectRaw("
                DATE_FORMAT(sold_at, '{$fmt}') as period,
                COUNT(*) as orders,
                COALESCE(SUM(subtotal), 0) as subtotal,
                COALESCE(SUM(discount_amount), 0) as discounts,
                COALESCE(SUM(tax_amount), 0) as tax,
                COALESCE(SUM(total), 0) as revenue
            ")
            ->get();

        // Units per period from sale_items
        $units = SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.company_id', $companyId)
            ->where('sales.status', '!=', 'cancelled')
            ->whereBetween(DB::raw('DATE(sales.sold_at)'), [$from, $to])
            ->groupBy(DB::raw("DATE_FORMAT(sales.sold_at, '{$fmt}')"))
            ->selectRaw("DATE_FORMAT(sales.sold_at, '{$fmt}') as period, SUM(sale_items.quantity) as units")
            ->pluck('units', 'period');

        return $rows->map(function ($row) use ($units, $groupBy) {
            $label = match ($groupBy) {
                'month' => Carbon::createFromFormat('Y-m', $row->period)->translatedFormat('M Y'),
                'year' => $row->period,
                default => Carbon::createFromFormat('Y-m-d', $row->period)->format('d/m/Y'),
            };

            return [
                'period' => $row->period,
                'label' => $label,
                'orders' => (int) $row->orders,
                'units' => (float) ($units[$row->period] ?? 0),
                'subtotal' => (float) $row->subtotal,
                'discounts' => (float) $row->discounts,
                'tax' => (float) $row->tax,
                'revenue' => (float) $row->revenue,
            ];
        })->values()->toArray();
    }

    private function buildTotals(int $companyId, string $from, string $to): array
    {
        $agg = Sale::query()
            ->where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween(DB::raw('DATE(sold_at)'), [$from, $to])
            ->selectRaw('
                COUNT(*) as orders,
                COALESCE(SUM(total), 0) as revenue,
                COALESCE(SUM(discount_amount), 0) as discounts,
                COALESCE(SUM(tax_amount), 0) as tax
            ')
            ->first();

        $units = SaleItem::query()
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sales.company_id', $companyId)
            ->where('sales.status', '!=', 'cancelled')
            ->whereBetween(DB::raw('DATE(sales.sold_at)'), [$from, $to])
            ->sum('sale_items.quantity');

        return [
            'orders' => (int) $agg->orders,
            'revenue' => (float) $agg->revenue,
            'discounts' => (float) $agg->discounts,
            'tax' => (float) $agg->tax,
            'units' => (float) $units,
            'avg_ticket' => $agg->orders > 0 ? round($agg->revenue / $agg->orders, 2) : 0,
        ];
    }

    private function previousPeriod(string $from, string $to): array
    {
        $start = Carbon::parse($from);
        $end = Carbon::parse($to);
        $days = $start->diffInDays($end) + 1;

        $prevTo = $start->copy()->subDay()->toDateString();
        $prevFrom = Carbon::parse($prevTo)->subDays($days - 1)->toDateString();

        return [$prevFrom, $prevTo];
    }
}
