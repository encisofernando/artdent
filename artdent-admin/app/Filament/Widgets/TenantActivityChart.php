<?php

namespace App\Filament\Widgets;

use App\Models\Tenant;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class TenantActivityChart extends ChartWidget
{
    protected ?string $heading = 'Nuevas empresas por mes';

    protected ?string $description = 'Evolución reciente del alta de tenants en la plataforma.';

    protected int|string|array $columnSpan = 'full';

    public static function getSort(): int
    {
        return 2;
    }

    protected function getData(): array
    {
        $data = collect(range(5, 0))->map(function (int $monthsAgo) {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'month' => $date->locale('es')->isoFormat('MMM YY'),
                'count' => Tenant::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        });

        return [
            'datasets' => [
                [
                    'label' => 'Nuevas empresas',
                    'data' => $data->pluck('count')->toArray(),
                    'backgroundColor' => 'rgba(14, 165, 233, 0.18)',
                    'borderColor' => '#0ea5e9',
                    'pointBackgroundColor' => '#14b8a6',
                    'pointBorderColor' => '#ffffff',
                    'pointHoverBackgroundColor' => '#0f172a',
                    'fill' => true,
                    'tension' => 0.4,
                ],
            ],
            'labels' => $data->pluck('month')->toArray(),
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
