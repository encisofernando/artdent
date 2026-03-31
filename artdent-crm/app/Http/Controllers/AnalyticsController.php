<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobCollaborator;
use App\Models\JobItem;
use App\Models\JobRemake;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AnalyticsController extends Controller
{
    public function lab(Request $request): InertiaResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        $period = $request->input('period', 'month');

        [$start, $end, $prevStart, $prevEnd] = $this->periodRanges($period);

        $baseQuery = fn () => Job::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled');

        // ── KPIs actuales ────────────────────────────────────────────────────
        $current = $baseQuery()->whereBetween('received_at', [$start, $end]);

        $totalJobs = (clone $current)->count();
        $revenue = (float) (clone $current)->sum('total');
        $pendingJobs = $baseQuery()
            ->whereNull('delivered_at')
            ->whereNotIn('status', ['delivered', 'cancelled'])
            ->count();

        $remakeCount = JobRemake::whereHas(
            'job',
            fn ($q) => $q
                ->where('company_id', $companyId)
                ->whereBetween('received_at', [$start, $end])
        )->count();

        $remakeRate = $totalJobs > 0 ? round($remakeCount / $totalJobs * 100, 1) : 0.0;

        $avgDeliveryDays = (float) (clone $current)
            ->whereNotNull('delivered_at')
            ->whereNotNull('received_at')
            ->selectRaw('AVG(DATEDIFF(delivered_at, received_at)) as avg_days')
            ->value('avg_days') ?? 0.0;

        $avgJobValue = $totalJobs > 0 ? round($revenue / $totalJobs, 2) : 0.0;

        // ── KPIs período anterior ─────────────────────────────────────────────
        $prevQuery = $baseQuery()->whereBetween('received_at', [$prevStart, $prevEnd]);
        $prevTotalJobs = (clone $prevQuery)->count();
        $prevRevenue = (float) (clone $prevQuery)->sum('total');
        $prevAvgJobValue = $prevTotalJobs > 0 ? round($prevRevenue / $prevTotalJobs, 2) : 0.0;
        $prevRemakeCount = JobRemake::whereHas(
            'job',
            fn ($q) => $q
                ->where('company_id', $companyId)
                ->whereBetween('received_at', [$prevStart, $prevEnd])
        )->count();
        $prevRemakeRate = $prevTotalJobs > 0 ? round($prevRemakeCount / $prevTotalJobs * 100, 1) : 0.0;
        $prevAvgDeliveryDays = (float) (clone $prevQuery)
            ->whereNotNull('delivered_at')
            ->whereNotNull('received_at')
            ->selectRaw('AVG(DATEDIFF(delivered_at, received_at)) as avg_days')
            ->value('avg_days') ?? 0.0;

        // ── Distribución por estado ───────────────────────────────────────────
        $statusDistribution = Job::where('company_id', $companyId)
            ->whereBetween('received_at', [$start, $end])
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => $row->status ?? 'sin_estado',
                'count' => (int) $row->count,
            ])
            ->toArray();

        // ── Top colaboradores ─────────────────────────────────────────────────
        $topCollaborators = JobCollaborator::select(
            'collaborator_id',
            DB::raw('COUNT(DISTINCT job_id) as job_count')
        )
            ->whereHas('job', fn ($q) => $q
                ->where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('received_at', [$start, $end])
            )
            ->groupBy('collaborator_id')
            ->orderByDesc('job_count')
            ->limit(8)
            ->with('collaborator:id,name,role')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->collaborator?->name ?? '—',
                'role' => $row->collaborator?->role ?? '',
                'job_count' => (int) $row->job_count,
            ])
            ->toArray();

        // ── Top 10 dentistas ──────────────────────────────────────────────────
        $topDentistsByRevenue = Job::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('received_at', [$start, $end])
            ->select('dentist_id', DB::raw('COUNT(*) as job_count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('dentist_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->with('dentist:id,name,city,zone')
            ->get()
            ->map(fn ($row) => [
                'dentist_id' => $row->dentist_id,
                'name' => $row->dentist?->name ?? '—',
                'city' => $row->dentist?->city ?? '',
                'zone' => $row->dentist?->zone ?? '',
                'job_count' => (int) $row->job_count,
                'revenue' => (float) $row->revenue,
            ])
            ->toArray();

        $topDentistsByJobs = Job::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('received_at', [$start, $end])
            ->select('dentist_id', DB::raw('COUNT(*) as job_count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('dentist_id')
            ->orderByDesc('job_count')
            ->limit(10)
            ->with('dentist:id,name,city,zone')
            ->get()
            ->map(fn ($row) => [
                'dentist_id' => $row->dentist_id,
                'name' => $row->dentist?->name ?? '—',
                'city' => $row->dentist?->city ?? '',
                'zone' => $row->dentist?->zone ?? '',
                'job_count' => (int) $row->job_count,
                'revenue' => (float) $row->revenue,
            ])
            ->toArray();

        // ── Trabajos por tipo ─────────────────────────────────────────────────
        $jobsByType = Job::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('received_at', [$start, $end])
            ->select('job_type_id', DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as revenue'))
            ->groupBy('job_type_id')
            ->orderByDesc('count')
            ->limit(8)
            ->with('job_type:id,name')
            ->get()
            ->map(fn ($row) => [
                'name' => $row->job_type?->name ?? 'Sin tipo',
                'count' => (int) $row->count,
                'revenue' => (float) $row->revenue,
            ])
            ->toArray();

        // ── Jobs por día de la semana ─────────────────────────────────────────
        $jobsByWeekday = Job::where('company_id', $companyId)
            ->where('status', '!=', 'cancelled')
            ->whereBetween('received_at', [$start, $end])
            ->selectRaw('DAYOFWEEK(received_at) as dow, COUNT(*) as count')
            ->groupBy('dow')
            ->orderBy('dow')
            ->get()
            ->keyBy('dow')
            ->pipe(function ($col) {
                // DAYOFWEEK: 1=Dom, 2=Lun, ..., 7=Sáb
                $labels = [1 => 'Dom', 2 => 'Lun', 3 => 'Mar', 4 => 'Mié', 5 => 'Jue', 6 => 'Vie', 7 => 'Sáb'];

                return collect($labels)->map(fn ($label, $dow) => [
                    'day' => $label,
                    'count' => (int) ($col->get($dow)?->count ?? 0),
                ])->values()->toArray();
            });

        // ── Top 10 aranceles más usados ───────────────────────────────────────
        $topTariffs = JobItem::select(
            'tariff_id',
            DB::raw('SUM(quantity) as qty_used'),
            DB::raw('SUM(total) as revenue'),
            DB::raw('COUNT(DISTINCT job_id) as job_count')
        )
            ->whereHas('job', fn ($q) => $q
                ->where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('received_at', [$start, $end])
            )
            ->whereNotNull('tariff_id')
            ->groupBy('tariff_id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->with('tariff:id,name,category,lab_sector')
            ->get()
            ->map(fn ($row) => [
                'tariff_id' => $row->tariff_id,
                'name' => $row->tariff?->name ?? '—',
                'category' => $row->tariff?->category ?? '',
                'lab_sector' => $row->tariff?->lab_sector ?? '',
                'qty_used' => (float) $row->qty_used,
                'job_count' => (int) $row->job_count,
                'revenue' => (float) $row->revenue,
            ])
            ->toArray();

        // ── Remakes — razones más comunes ─────────────────────────────────────
        $topRemakeReasons = JobRemake::select(
            'reason_category',
            DB::raw('COUNT(*) as count')
        )
            ->whereHas('job', fn ($q) => $q
                ->where('company_id', $companyId)
                ->whereBetween('received_at', [$start, $end])
            )
            ->groupBy('reason_category')
            ->orderByDesc('count')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'reason' => $row->reason_category ?? 'Sin especificar',
                'count' => (int) $row->count,
            ])
            ->toArray();

        // ── Serie temporal de revenue ─────────────────────────────────────────
        $timeSeriesRevenue = $this->buildTimeSeries($period, $start, $end, $companyId);

        // ── Armar respuesta ───────────────────────────────────────────────────
        $kpis = [
            'current' => [
                'total_jobs' => $totalJobs,
                'revenue' => $revenue,
                'pending_jobs' => $pendingJobs,
                'remake_rate' => $remakeRate,
                'avg_delivery_days' => round($avgDeliveryDays, 1),
                'avg_job_value' => $avgJobValue,
            ],
            'trends' => [
                'total_jobs' => $this->trendPct($totalJobs, $prevTotalJobs),
                'revenue' => $this->trendPct($revenue, $prevRevenue),
                'remake_rate' => $this->trendPct($remakeRate, $prevRemakeRate),
                'avg_delivery_days' => $this->trendPct($avgDeliveryDays, $prevAvgDeliveryDays),
                'avg_job_value' => $this->trendPct($avgJobValue, $prevAvgJobValue),
            ],
        ];

        return Inertia::render('Analytics/Lab', [
            'kpis' => $kpis,
            'statusDistribution' => $statusDistribution,
            'topDentistsByRevenue' => $topDentistsByRevenue,
            'topDentistsByJobs' => $topDentistsByJobs,
            'topCollaborators' => $topCollaborators,
            'topTariffs' => $topTariffs,
            'topRemakeReasons' => $topRemakeReasons,
            'jobsByType' => $jobsByType,
            'jobsByWeekday' => $jobsByWeekday,
            'timeSeriesRevenue' => $timeSeriesRevenue,
            'filters' => [
                'period' => $period,
            ],
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
    private function buildTimeSeries(string $period, Carbon $start, Carbon $end, int $companyId): array
    {
        $points = [];

        if ($period === 'today') {
            $cursor = $start->copy()->startOfHour();
            while ($cursor->lte($end)) {
                $hStart = $cursor->copy();
                $hEnd = $cursor->copy()->endOfHour();
                $rev = (float) Job::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('received_at', [$hStart, $hEnd])
                    ->sum('total');
                $cnt = Job::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('received_at', [$hStart, $hEnd])
                    ->count();
                $points[] = ['label' => $cursor->format('H:00'), 'revenue' => round($rev, 2), 'jobs' => $cnt];
                $cursor->addHour();
            }

            return $points;
        }

        if ($period === 'year') {
            $cursor = $start->copy()->startOfMonth();
            while ($cursor->lte($end)) {
                $mStart = $cursor->copy()->startOfMonth();
                $mEnd = $cursor->copy()->endOfMonth();
                $rev = (float) Job::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('received_at', [$mStart, $mEnd])
                    ->sum('total');
                $cnt = Job::where('company_id', $companyId)
                    ->where('status', '!=', 'cancelled')
                    ->whereBetween('received_at', [$mStart, $mEnd])
                    ->count();
                $points[] = ['label' => $cursor->translatedFormat('M'), 'revenue' => round($rev, 2), 'jobs' => $cnt];
                $cursor->addMonth();
            }

            return $points;
        }

        // week / month — daily
        $cursor = $start->copy()->startOfDay();
        while ($cursor->lte($end)) {
            $dStart = $cursor->copy()->startOfDay();
            $dEnd = $cursor->copy()->endOfDay();
            $rev = (float) Job::where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('received_at', [$dStart, $dEnd])
                ->sum('total');
            $cnt = Job::where('company_id', $companyId)
                ->where('status', '!=', 'cancelled')
                ->whereBetween('received_at', [$dStart, $dEnd])
                ->count();
            $points[] = ['label' => $cursor->format('d/m'), 'revenue' => round($rev, 2), 'jobs' => $cnt];
            $cursor->addDay();
        }

        return $points;
    }
}
