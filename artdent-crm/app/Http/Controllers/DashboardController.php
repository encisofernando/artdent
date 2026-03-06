<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // For now, we will pass some dummy stats until we wire up the real API endpoints.
        // Once we have actual database queries, we will replace these simulated stats.
        $stats = [
            'current' => [
                'total_sales' => 1500,
                'revenue' => 1250000,
                'new_customers' => 45,
                'avg_ticket' => 850,
                'items_sold' => 3200
            ],
            'trends' => [
                'sales' => 12.5,
                'revenue' => 8.4,
                'customers' => -2.1,
                'avg_ticket' => 5.0
            ]
        ];

        // Simulate recent transactions
        $transactions = [
            ['txId' => 'TX-10025', 'user' => 'Dr. Gomez', 'cost' => 12500, 'date' => '05/03/2026 14:30'],
            ['txId' => 'TX-10024', 'user' => 'Clinica Dental', 'cost' => 45000, 'date' => '05/03/2026 12:15'],
            ['txId' => 'TX-10023', 'user' => 'Juan Perez', 'cost' => 8500, 'date' => '04/03/2026 09:45'],
            ['txId' => 'TX-10022', 'user' => 'Maria Silva', 'cost' => 32000, 'date' => '02/03/2026 16:20'],
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentTransactions' => $transactions
        ]);
    }
}
