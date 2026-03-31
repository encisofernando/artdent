<?php

namespace App\Filament\Widgets;

use App\Models\Tenant;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    public static function getSort(): int
    {
        return 1;
    }

    protected function getStats(): array
    {
        $total = Tenant::count();
        $active = Tenant::where('status', 'active')->count();
        $trial = Tenant::where('status', 'trial')->count();
        $suspended = Tenant::where('status', 'suspended')->count();
        $newThisMonth = Tenant::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return [
            Stat::make('Total de empresas', $total)
                ->description('Registradas en el sistema')
                ->descriptionIcon('heroicon-m-building-office-2')
                ->color('primary'),

            Stat::make('Activas', $active)
                ->description("+{$newThisMonth} este mes")
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->color('success'),

            Stat::make('En período de prueba', $trial)
                ->description('Con acceso completo')
                ->descriptionIcon('heroicon-m-clock')
                ->color('warning'),

            Stat::make('Suspendidas', $suspended)
                ->description('Requieren atención')
                ->descriptionIcon('heroicon-m-exclamation-triangle')
                ->color('danger'),
        ];
    }
}
