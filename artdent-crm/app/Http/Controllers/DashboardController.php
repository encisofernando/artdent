<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // TODO: acá calculás y pasás stats reales
        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'current' => [
                    'total_sales'   => 0,
                    'revenue'       => 0,
                    'new_customers' => 0,
                    'avg_ticket'    => 0,
                ],
            ],
        ]);
    }
}
