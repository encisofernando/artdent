<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\Training;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CapacitacionesController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();

        $trainings = Training::query()
            ->where('company_id', $companyId)
            ->with(['sessions' => fn ($q) => $q->orderByDesc('start_date'), 'sessions.enrollments.employee.user:id,name'])
            ->orderBy('name')
            ->get();

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'user_id']);

        return Inertia::render('Rrhh/Capacitaciones/Index', [
            'trainings' => $trainings,
            'employees' => $employees,
        ]);
    }
}
