<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;
        $search = $request->input('search');
        $active = $request->input('active');

        $query = Employee::query()
            ->with('user:id,name,email')
            ->where('company_id', $companyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('position', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%"));
            });
        }

        if ($active !== null && $active !== '') {
            $query->where('is_active', (bool) $active);
        }

        $items = $query->orderBy('is_active', 'desc')
            ->orderByDesc('hire_date')
            ->paginate(20)
            ->withQueryString();

        $users = User::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('Employee/Index', [
            'items' => $items,
            'users' => $users,
            'filters' => ['search' => $search, 'active' => $active],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'dni' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:100'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'hire_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:hire_date'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        Employee::create(array_merge($validated, ['company_id' => $companyId]));

        return back()->with('success', 'Empleado registrado.');
    }

    public function show(Employee $employee): Response
    {
        $companyId = auth()->user()->company_id ?? 1;
        abort_unless((int) $employee->company_id === $companyId, 404);

        $employee->load([
            'user:id,name,email',
            'receipts' => fn ($q) => $q->orderByDesc('period_from')->limit(12),
        ]);

        $extras = $employee->extras()->orderByDesc('date')->get();
        $discounts = $employee->discounts()->orderByDesc('date')->get();

        return Inertia::render('Employee/Show', [
            'employee' => $employee,
            'extras' => $extras,
            'discounts' => $discounts,
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;
        abort_unless((int) $employee->company_id === $companyId, 404);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'dni' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:100'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'hire_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:hire_date'],
            'is_active' => ['boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $employee->update($validated);

        return back()->with('success', 'Empleado actualizado.');
    }

    public function destroy(Employee $employee): RedirectResponse
    {
        $companyId = auth()->user()->company_id ?? 1;
        abort_unless((int) $employee->company_id === $companyId, 404);

        abort_if(
            $employee->receipts()->where('status', 'draft')->exists(),
            422,
            'No se puede eliminar: hay recibos en borrador pendientes.'
        );

        $employee->delete();

        return redirect()->route('employees.index')->with('success', 'Empleado eliminado.');
    }
}
