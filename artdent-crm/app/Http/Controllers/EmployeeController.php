<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\LaborAgreementCategory;
use App\Models\Position;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
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
        $companyId = CompanyContext::id();

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'dni' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:100'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'job_commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
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
        $companyId = CompanyContext::id();
        abort_unless((int) $employee->company_id === $companyId, 404);

        $employee->load([
            'user:id,name,email',
            'department:id,name',
            'jobPosition:id,name',
            'supervisor:id,user_id',
            'supervisor.user:id,name',
            'laborAgreementCategory:id,labor_agreement_id,name',
            'laborAgreementCategory.laborAgreement:id,name',
            'documents' => fn ($q) => $q->orderByDesc('created_at'),
            'familyMembers' => fn ($q) => $q->orderBy('name'),
            'receipts' => fn ($q) => $q->orderByDesc('period_from')->limit(12),
            'webAuthnCredentials' => fn ($q) => $q->orderByDesc('created_at'),
        ]);

        $extras = $employee->extras()->orderByDesc('date')->get();
        $discounts = $employee->discounts()->orderByDesc('date')->get();

        $companyDepartments = Department::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $companyPositions = Position::query()
            ->where('company_id', $companyId)
            ->orderBy('name')
            ->get(['id', 'name']);

        $companyEmployees = Employee::query()
            ->with('user:id,name')
            ->where('company_id', $companyId)
            ->where('id', '!=', $employee->id)
            ->get(['id', 'user_id']);

        $laborAgreementCategories = LaborAgreementCategory::query()
            ->with('laborAgreement:id,name')
            ->whereHas('laborAgreement', fn ($q) => $q->whereNull('company_id')->orWhere('company_id', $companyId))
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'labor_agreement_id', 'name']);

        return Inertia::render('Employee/Show', [
            'employee' => $employee,
            'extras' => $extras,
            'discounts' => $discounts,
            'departments' => $companyDepartments,
            'positions' => $companyPositions,
            'employeeOptions' => $companyEmployees,
            'laborAgreementCategories' => $laborAgreementCategories,
        ]);
    }

    public function legajo(Request $request, Employee $employee): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $employee->company_id === $companyId, 404);

        $validated = $request->validate([
            'cuil' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:30'],
            'marital_status' => ['nullable', 'string', 'max:30'],
            'nationality' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'province' => ['nullable', 'string', 'max:100'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:30'],
            'personal_email' => ['nullable', 'email', 'max:191'],
            'bank_cbu' => ['nullable', 'string', 'max:22'],
            'bank_name' => ['nullable', 'string', 'max:100'],
            'health_insurance' => ['nullable', 'string', 'max:191'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'position_id' => ['nullable', 'integer', 'exists:positions,id'],
            'supervisor_id' => ['nullable', 'integer', 'exists:employees,id', 'different:id'],
            'labor_agreement_category_id' => ['nullable', 'integer', 'exists:labor_agreement_categories,id'],
            'art_provider_id' => ['nullable', 'integer', 'exists:art_providers,id'],
        ]);

        $employee->update($validated);

        return back()->with('success', 'Legajo actualizado.');
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless((int) $employee->company_id === $companyId, 404);

        $validated = $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'dni' => ['nullable', 'string', 'max:20'],
            'position' => ['nullable', 'string', 'max:100'],
            'salary' => ['nullable', 'numeric', 'min:0'],
            'commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'job_commission_pct' => ['nullable', 'numeric', 'min:0', 'max:100'],
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
        $companyId = CompanyContext::id();
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
