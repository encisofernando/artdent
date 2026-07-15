<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturnItem;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CostProfitReportController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        [$from, $to] = $this->resolveRange($request);

        $rows = $this->buildRows($companyId, $from, $to);

        return Inertia::render('Reportes/CostosGanancias', [
            'rows' => $rows->values(),
            'totals' => [
                'revenue' => round($rows->sum('revenue'), 2),
                'cost' => round($rows->sum('cost'), 2),
                'margin' => round($rows->sum('margin'), 2),
            ],
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
        ]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $companyId = CompanyContext::id();
        [$from, $to] = $this->resolveRange($request);
        $rows = $this->buildRows($companyId, $from, $to);

        $filename = "costos_ganancias_{$from->format('Ymd')}_{$to->format('Ymd')}.csv";

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, ['Artículo', 'SKU', 'Cantidad', 'Ingresos', 'Costo', 'Margen', 'Margen %'], ';');
            foreach ($rows as $row) {
                fputcsv($out, [
                    $row['name'],
                    $row['sku'],
                    $row['qty'],
                    number_format($row['revenue'], 2, ',', '.'),
                    number_format($row['cost'], 2, ',', '.'),
                    number_format($row['margin'], 2, ',', '.'),
                    number_format($row['margin_pct'], 1, ',', '.').'%',
                ], ';');
            }
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /** @return array{0: Carbon, 1: Carbon} */
    private function resolveRange(Request $request): array
    {
        $from = $request->filled('from') ? Carbon::parse($request->input('from'))->startOfDay() : now()->startOfMonth();
        $to = $request->filled('to') ? Carbon::parse($request->input('to'))->endOfDay() : now()->endOfDay();

        return [$from, $to];
    }

    /** @return \Illuminate\Support\Collection<int, array<string, mixed>> */
    private function buildRows(int $companyId, Carbon $from, Carbon $to): \Illuminate\Support\Collection
    {
        $sold = SaleItem::query()
            ->select('product_id', 'product_name', 'sku')
            ->selectRaw('SUM(quantity) as qty')
            ->selectRaw('SUM(total) as revenue')
            ->whereHas('sale', fn ($q) => $q->where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('sold_at', [$from, $to]))
            ->groupBy('product_id', 'product_name', 'sku')
            ->get();

        $returned = SaleReturnItem::query()
            ->join('sale_items', 'sale_items.id', '=', 'sale_return_items.sale_item_id')
            ->whereIn('sale_items.sale_id', Sale::where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('sold_at', [$from, $to])
                ->select('id'))
            ->selectRaw('sale_items.product_id as product_id')
            ->selectRaw('SUM(sale_return_items.quantity) as qty')
            ->selectRaw('SUM(sale_return_items.total) as amount')
            ->groupBy('sale_items.product_id')
            ->get()
            ->keyBy('product_id');

        $productIds = $sold->pluck('product_id')->filter()->all();
        $costPrices = Product::whereIn('id', $productIds)->pluck('cost_price', 'id');

        return $sold->map(function ($item) use ($returned, $costPrices) {
            $ret = $item->product_id ? $returned->get($item->product_id) : null;
            $netQty = (float) $item->qty - (float) ($ret->qty ?? 0);
            $netRevenue = round((float) $item->revenue - (float) ($ret->amount ?? 0), 2);
            $costPrice = (float) ($costPrices[$item->product_id] ?? 0);
            $cost = round($netQty * $costPrice, 2);
            $margin = round($netRevenue - $cost, 2);

            return [
                'product_id' => $item->product_id,
                'name' => $item->product_name,
                'sku' => $item->sku,
                'qty' => $netQty,
                'revenue' => $netRevenue,
                'cost' => $cost,
                'margin' => $margin,
                'margin_pct' => $netRevenue > 0 ? round($margin / $netRevenue * 100, 1) : 0,
            ];
        })->sortByDesc('margin');
    }
}
