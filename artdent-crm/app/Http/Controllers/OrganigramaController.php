<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrganigramaController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;

        $departments = Department::query()
            ->where('company_id', $companyId)
            ->withCount(['employees', 'positions'])
            ->orderBy('name')
            ->get();

        $positions = Position::query()
            ->where('company_id', $companyId)
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        $employees = Employee::query()
            ->with(['user:id,name,email', 'department:id,name', 'jobPosition:id,name', 'supervisor:id,user_id', 'supervisor.user:id,name'])
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get(['id', 'user_id', 'department_id', 'position_id', 'supervisor_id', 'position']);

        return Inertia::render('Rrhh/Organigrama/Index', [
            'departments' => $departments,
            'positions' => $positions,
            'employees' => $employees,
        ]);
    }
}
