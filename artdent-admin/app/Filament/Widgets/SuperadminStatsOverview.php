<?php

namespace App\Filament\Widgets;

use App\Models\Plan;
use App\Models\Tenant;
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class SuperadminStatsOverview extends BaseWidget
{
    protected ?string $pollingInterval = '30s';

    protected function getStats(): array
    {
        $totalTenants = Tenant::count();
        $activeTenants = Tenant::where('status', 'active')->count();
        $activePlans = Plan::where('is_active', true)->count();

        return [
            Stat::make('Firmas / Clínicas Totales', $totalTenants)
                ->description($activeTenants . ' empresas activas actualmente')
                ->descriptionIcon('heroicon-m-building-office')
                ->color('primary')
                ->chart([7, 3, 4, 5, 6, 3, 5, 3]),

            Stat::make('Tenants Activos', $activeTenants)
                ->description('Clínicas con suscripción activa')
                ->descriptionIcon('heroicon-m-check-badge')
                ->color('success')
                ->chart([3, 5, 7, 4, 6, 8, 9, 10]),

            Stat::make('Planes Disponibles', $activePlans)
                ->description('Planes públicos e internos')
                ->descriptionIcon('heroicon-m-credit-card')
                ->color('info'),
        ];
    }
}
