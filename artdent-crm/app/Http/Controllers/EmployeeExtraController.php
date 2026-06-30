<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeExtra;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeExtraController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $employeeId = $request->input('employee_id');
        $search = trim((string) $request->input('search', ''));
        $from = $request->input('from');
        $to = $request->input('to');

        $query = EmployeeExtra::query()
            ->with('employee.user:id,name')
            ->where('company_id', $companyId);

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($search !== '') {
            $query->where('concept', 'like', "%{$search}%");
        }

        if ($from) {
            $query->where('date', '>=', $from);
        }

        if ($to) {
            $query->where('date', '<=', $to);
        }

        $summaryQuery = clone $query;
        $items = $query->orderByDesc('date')->orderByDesc('id')->paginate(20)->withQueryString();

        $employees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('is_active', true)
            ->get();

        return Inertia::render('EmployeeExtra/Index', [
            'items' => $items,
            'employees' => $employees,
            'filters' => ['employee_id' => $employeeId, 'search' => $search, 'from' => $from, 'to' => $to],
            'summary' => [
                'records' => (clone $summaryQuery)->count(),
                'amount' => round((float) ((clone $summaryQuery)->sum('amount') ?? 0), 2),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'date' => ['required', 'date'],
            'concept' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        EmployeeExtra::create(array_merge($validated, ['company_id' => $companyId]));

        return back()->with('success', 'Extra registrado.');
    }

    public function update(Request $request, EmployeeExtra $employeeExtra): RedirectResponse
    {
        abort_unless((int) $employeeExtra->company_id === ($request->user()->company_id ?? 1), 404);

        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'date' => ['required', 'date'],
            'concept' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
        ]);

        $employeeExtra->update($validated);

        return back()->with('success', 'Extra actualizado.');
    }

    public function destroy(EmployeeExtra $employeeExtra): RedirectResponse
    {
        abort_unless((int) $employeeExtra->company_id === (auth()->user()->company_id ?? 1), 404);

        $employeeExtra->delete();

        return back()->with('success', 'Extra eliminado.');
    }
}
