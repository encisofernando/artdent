<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $stats = [
            'total' => Tenant::count(),
            'active' => Tenant::where('status', 'active')->count(),
            'trial' => Tenant::where('status', 'trial')->count(),
            'suspended' => Tenant::where('status', 'suspended')->count(),
            'new_this_month' => Tenant::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'active_plans' => Plan::where('is_active', true)->count(),
        ];

        $activity = collect(range(5, 0))->map(function (int $monthsAgo) {
            $date = Carbon::now()->subMonths($monthsAgo);

            return [
                'month' => ucfirst($date->locale('es')->isoFormat('MMM YY')),
                'count' => Tenant::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        })->values();

        $recentTenants = Tenant::orderByDesc('created_at')->limit(6)->get(
            ['id', 'name', 'plan', 'status', 'created_at']
        );

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'activity' => $activity,
            'recentTenants' => $recentTenants,
        ]);
    }
}
