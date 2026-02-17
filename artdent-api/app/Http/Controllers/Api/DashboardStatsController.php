<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class DashboardStatsController extends Controller
{
    /**
     * Obtener estadísticas generales del dashboard
     * GET /api/dashboard/stats?period=month&start_date=2026-01-01&end_date=2026-01-31
     */
    public function getStats(Request $request)
    {
        $companyId = $request->user()->company_id;

        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        [$currentStart, $currentEnd, $previousStart, $previousEnd] = $this->calculatePeriodDates($period, $startDate, $endDate);

        $currentStats = $this->getStatsForPeriod($companyId, $currentStart, $currentEnd);
        $previousStats = $this->getStatsForPeriod($companyId, $previousStart, $previousEnd);
        $trends = $this->calculateTrends($currentStats, $previousStats);

        return response()->json([
            'current' => $currentStats,
            'previous' => $previousStats,
            'trends' => $trends,
            'period' => [
                'type' => $period,
                'current_start' => $currentStart,
                'current_end' => $currentEnd,
                'previous_start' => $previousStart,
                'previous_end' => $previousEnd,
            ],
        ]);
    }

    /**
     * Obtener datos para gráficos
     * GET /api/dashboard/charts?type=revenue&period=month
     */
    public function getChartData(Request $request)
    {
        $companyId = $request->user()->company_id;
        $type = $request->input('type', 'revenue');
        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $data = match ($type) {
            'revenue' => $this->getRevenueChart($companyId, $period, $startDate, $endDate),
            'sales' => $this->getSalesChart($companyId, $period, $startDate, $endDate),
            'products' => $this->getProductsChart($companyId, $period, $startDate, $endDate),
            'categories' => $this->getCategoriesChart($companyId, $period, $startDate, $endDate),
            default => [],
        };

        return response()->json($data);
    }

    /**
     * Obtener transacciones recientes
     * GET /api/dashboard/recent-transactions?limit=10
     */
    public function getRecentTransactions(Request $request)
    {
        $companyId = $request->user()->company_id;
        $limit = $request->input('limit', 10);

        $transactions = DB::table('sales')
            ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id')
            ->leftJoin('users', 'sales.cashier_id', '=', 'users.id')
            ->where('sales.company_id', $companyId)
            ->select(
                'sales.id',
                'sales.number as txId',
                'sales.sale_date as date',
                'sales.total as cost',
                DB::raw('COALESCE(customers.name, "Consumidor Final") as user'),
                DB::raw('COALESCE(users.name, "Sistema") as cashier'),
                'sales.status'
            )
            ->orderBy('sales.sale_date', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                return [
                    'txId' => $item->txId ?? 'V' . str_pad($item->id, 8, '0', STR_PAD_LEFT),
                    'user' => $item->user,
                    'date' => Carbon::parse($item->date)->format('d/m/Y H:i'),
                    'cost' => number_format($item->cost, 2, '.', ''),
                    'status' => $item->status,
                    'cashier' => $item->cashier,
                ];
            });

        return response()->json($transactions);
    }

    /**
     * Exportar dashboard a PDF
     * GET /api/dashboard/export/pdf
     */
    public function exportPDF(Request $request)
    {
        $companyId = $request->user()->company_id;
        $company = DB::table('companies')->find($companyId);

        $period = $request->input('period', 'month');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        [$currentStart, $currentEnd] = array_slice(
            $this->calculatePeriodDates($period, $startDate, $endDate),
            0,
            2
        );

        $stats = $this->getStatsForPeriod($companyId, $currentStart, $currentEnd);
        $transactions = DB::table('sales')
            ->leftJoin('customers', 'sales.customer_id', '=', 'customers.id')
            ->where('sales.company_id', $companyId)
            ->whereBetween('sales.sale_date', [$currentStart, $currentEnd])
            ->select(
                'sales.number',
                'sales.sale_date',
                'sales.total',
                DB::raw('COALESCE(customers.name, "Consumidor Final") as customer')
            )
            ->orderBy('sales.sale_date', 'desc')
            ->limit(20)
            ->get();

        $data = [
            'company' => $company,
            'period' => $period,
            'start_date' => Carbon::parse($currentStart)->format('d/m/Y'),
            'end_date' => Carbon::parse($currentEnd)->format('d/m/Y'),
            'stats' => $stats,
            'transactions' => $transactions,
            'generated_at' => Carbon::now()->format('d/m/Y H:i'),
        ];

        $pdf = Pdf::loadView('pdf.dashboard', $data);
        return $pdf->download('dashboard_' . date('Y-m-d') . '.pdf');
    }

    /**
     * Obtener layout de widgets guardado
     * GET /api/dashboard/layout
     */
    public function getLayout(Request $request)
    {
        $userId = $request->user()->id;

        $layout = DB::table('user_preferences')
            ->where('user_id', $userId)
            ->where('key', 'dashboard_layout')
            ->value('value');

        return response()->json([
            'layout' => $layout ? json_decode($layout, true) : null,
        ]);
    }

    /**
     * Guardar layout de widgets
     * POST /api/dashboard/layout
     */
    public function saveLayout(Request $request)
    {
        $userId = $request->user()->id;
        $layout = $request->input('layout');

        DB::table('user_preferences')->updateOrInsert(
            ['user_id' => $userId, 'key' => 'dashboard_layout'],
            ['value' => json_encode($layout), 'updated_at' => now()]
        );

        return response()->json(['success' => true]);
    }

    // ========== MÉTODOS PRIVADOS ==========

    private function calculatePeriodDates($period, $startDate, $endDate)
    {
        $now = Carbon::now();

        switch ($period) {
            case 'today':
                $currentStart = $now->copy()->startOfDay();
                $currentEnd = $now->copy()->endOfDay();
                $previousStart = $now->copy()->subDay()->startOfDay();
                $previousEnd = $now->copy()->subDay()->endOfDay();
                break;

            case 'week':
                $currentStart = $now->copy()->startOfWeek();
                $currentEnd = $now->copy()->endOfWeek();
                $previousStart = $now->copy()->subWeek()->startOfWeek();
                $previousEnd = $now->copy()->subWeek()->endOfWeek();
                break;

            case 'month':
                $currentStart = $now->copy()->startOfMonth();
                $currentEnd = $now->copy()->endOfMonth();
                $previousStart = $now->copy()->subMonth()->startOfMonth();
                $previousEnd = $now->copy()->subMonth()->endOfMonth();
                break;

            case 'year':
                $currentStart = $now->copy()->startOfYear();
                $currentEnd = $now->copy()->endOfYear();
                $previousStart = $now->copy()->subYear()->startOfYear();
                $previousEnd = $now->copy()->subYear()->endOfYear();
                break;

            case 'custom':
                if ($startDate && $endDate) {
                    $currentStart = Carbon::parse($startDate)->startOfDay();
                    $currentEnd = Carbon::parse($endDate)->endOfDay();
                    $days = $currentStart->diffInDays($currentEnd);
                    $previousStart = $currentStart->copy()->subDays($days + 1);
                    $previousEnd = $currentEnd->copy()->subDays($days + 1);
                } else {
                    $currentStart = $now->copy()->startOfMonth();
                    $currentEnd = $now->copy()->endOfMonth();
                    $previousStart = $now->copy()->subMonth()->startOfMonth();
                    $previousEnd = $now->copy()->subMonth()->endOfMonth();
                }
                break;

            default:
                $currentStart = $now->copy()->startOfMonth();
                $currentEnd = $now->copy()->endOfMonth();
                $previousStart = $now->copy()->subMonth()->startOfMonth();
                $previousEnd = $now->copy()->subMonth()->endOfMonth();
        }

        return [
            $currentStart->toDateTimeString(),
            $currentEnd->toDateTimeString(),
            $previousStart->toDateTimeString(),
            $previousEnd->toDateTimeString(),
        ];
    }

    private function getStatsForPeriod($companyId, $startDate, $endDate)
    {
        $salesStats = DB::table('sales')
            ->where('company_id', $companyId)
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->whereNull('deleted_at')
            ->select(
                DB::raw('COUNT(*) as total_sales'),
                DB::raw('COALESCE(SUM(total), 0) as revenue'),
                DB::raw('COALESCE(SUM(subtotal), 0) as subtotal'),
                DB::raw('COALESCE(SUM(tax_total), 0) as tax'),
                DB::raw('COALESCE(AVG(total), 0) as avg_ticket')
            )
            ->first();

        $newCustomers = DB::table('customers')
            ->where('company_id', $companyId)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNull('deleted_at')
            ->count();

        $itemsSold = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.company_id', $companyId)
            ->whereBetween('sales.sale_date', [$startDate, $endDate])
            ->whereNull('sales.deleted_at')
            ->sum('sale_items.qty');

        return [
            'total_sales' => (int) $salesStats->total_sales,
            'revenue' => (float) $salesStats->revenue,
            'subtotal' => (float) $salesStats->subtotal,
            'tax' => (float) $salesStats->tax,
            'avg_ticket' => (float) $salesStats->avg_ticket,
            'new_customers' => (int) $newCustomers,
            'items_sold' => (int) $itemsSold,
        ];
    }

    private function calculateTrends($current, $previous)
    {
        $calculateChange = function ($currentValue, $previousValue) {
            if ($previousValue == 0) {
                return $currentValue > 0 ? 100 : 0;
            }
            return round((($currentValue - $previousValue) / $previousValue) * 100, 1);
        };

        return [
            'sales' => $calculateChange($current['total_sales'], $previous['total_sales']),
            'revenue' => $calculateChange($current['revenue'], $previous['revenue']),
            'customers' => $calculateChange($current['new_customers'], $previous['new_customers']),
            'avg_ticket' => $calculateChange($current['avg_ticket'], $previous['avg_ticket']),
        ];
    }

    private function getRevenueChart($companyId, $period, $startDate = null, $endDate = null)
    {
        if (!$startDate || !$endDate) {
            [$startDate, $endDate] = array_slice(
                $this->calculatePeriodDates($period, null, null),
                0,
                2
            );
        }

        $data = DB::table('sales')
            ->where('company_id', $companyId)
            ->whereBetween('sale_date', [$startDate, $endDate])
            ->whereNull('deleted_at')
            ->select(
                DB::raw("DATE(sale_date) as date"),
                DB::raw('COALESCE(SUM(total), 0) as value')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            [
                'id' => 'Ingresos',
                'color' => 'hsl(141, 70%, 50%)',
                'data' => $data->map(fn($item) => [
                    'x' => Carbon::parse($item->date)->format('d/m'),
                    'y' => (float) $item->value,
                ])->toArray(),
            ],
        ];
    }

    private function getSalesChart($companyId, $period, $startDate = null, $endDate = null)
    {
        if (!$startDate || !$endDate) {
            [$startDate, $endDate] = array_slice(
                $this->calculatePeriodDates($period, null, null),
                0,
                2
            );
        }

        $data = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.company_id', $companyId)
            ->whereBetween('sales.sale_date', [$startDate, $endDate])
            ->whereNull('sales.deleted_at')
            ->select(
                'products.name as product',
                DB::raw('COALESCE(SUM(sale_items.qty), 0) as qty'),
                DB::raw('COALESCE(SUM(sale_items.line_total), 0) as total')
            )
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('qty')
            ->limit(6)
            ->get();

        return $data->map(fn($item, $index) => [
            'country' => $item->product,
            'value' => (int) $item->qty,
            'color' => $this->getColor($index),
        ])->toArray();
    }

    private function getProductsChart($companyId, $period, $startDate = null, $endDate = null)
    {
        $data = DB::table('products')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('products.company_id', $companyId)
            ->whereNull('products.deleted_at')
            ->select(
                DB::raw('COALESCE(categories.name, "Sin categoría") as category'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('category')
            ->get();

        return $data->map(fn($item, $index) => [
            'id' => $item->category,
            'label' => $item->category,
            'value' => (int) $item->count,
            'color' => $this->getColor($index),
        ])->toArray();
    }

    private function getCategoriesChart($companyId, $period, $startDate = null, $endDate = null)
    {
        if (!$startDate || !$endDate) {
            [$startDate, $endDate] = array_slice(
                $this->calculatePeriodDates($period, null, null),
                0,
                2
            );
        }

        $data = DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->leftJoin('categories', 'products.category_id', '=', 'categories.id')
            ->where('sales.company_id', $companyId)
            ->whereBetween('sales.sale_date', [$startDate, $endDate])
            ->whereNull('sales.deleted_at')
            ->select(
                DB::raw('COALESCE(categories.name, "Sin categoría") as category'),
                DB::raw('COALESCE(SUM(sale_items.line_total), 0) as total')
            )
            ->groupBy('category')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return $data->map(fn($item, $index) => [
            'id' => $item->category,
            'label' => $item->category,
            'value' => (float) $item->total,
            'color' => $this->getColor($index),
        ])->toArray();
    }

    private function getColor($index)
    {
        $colors = [
            'hsl(141, 70%, 50%)', // Verde
            'hsl(207, 70%, 50%)', // Azul
            'hsl(291, 70%, 50%)', // Violeta
            'hsl(45, 70%, 50%)',  // Amarillo
            'hsl(10, 70%, 50%)',  // Rojo
            'hsl(180, 70%, 50%)', // Cyan
        ];
        return $colors[$index % count($colors)];
    }
}
