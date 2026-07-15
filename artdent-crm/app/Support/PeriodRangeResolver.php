<?php

namespace App\Support;

use Carbon\Carbon;
use Carbon\CarbonInterface;

/**
 * Calcula el rango de fechas (actual y anterior) para los selectores de período
 * "Hoy/Semana/Mes/Año" de los dashboards, anclado a una fecha de referencia en vez
 * de siempre "ahora" — así se puede navegar a un período anterior o posterior,
 * no solo ver el período actual.
 */
class PeriodRangeResolver
{
    /**
     * @return array{0: CarbonInterface, 1: CarbonInterface, 2: CarbonInterface, 3: CarbonInterface} [start, end, prevStart, prevEnd]
     */
    public static function resolve(string $period, ?string $referenceDate = null): array
    {
        $anchor = $referenceDate ? Carbon::parse($referenceDate) : Carbon::now();
        $now = Carbon::now();

        return match ($period) {
            'today' => [
                $anchor->copy()->startOfDay(),
                $anchor->isSameDay($now) ? $now->copy() : $anchor->copy()->endOfDay(),
                $anchor->copy()->subDay()->startOfDay(),
                $anchor->copy()->subDay()->endOfDay(),
            ],
            'week' => [
                $anchor->copy()->startOfWeek(CarbonInterface::MONDAY),
                $anchor->copy()->endOfWeek(CarbonInterface::SUNDAY),
                $anchor->copy()->subWeek()->startOfWeek(CarbonInterface::MONDAY),
                $anchor->copy()->subWeek()->endOfWeek(CarbonInterface::SUNDAY),
            ],
            'year' => [
                $anchor->copy()->startOfYear(),
                $anchor->isSameYear($now) ? $now->copy() : $anchor->copy()->endOfYear(),
                $anchor->copy()->subYear()->startOfYear(),
                $anchor->copy()->subYear()->endOfYear(),
            ],
            default => [
                $anchor->copy()->startOfMonth(),
                $anchor->isSameMonth($now) ? $now->copy() : $anchor->copy()->endOfMonth(),
                $anchor->copy()->subMonth()->startOfMonth(),
                $anchor->copy()->subMonth()->endOfMonth(),
            ],
        };
    }
}
