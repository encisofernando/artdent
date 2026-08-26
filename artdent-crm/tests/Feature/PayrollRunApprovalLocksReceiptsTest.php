<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Employee;
use App\Models\EmployeeReceipt;
use App\Models\Module;
use App\Models\PayrollRun;
use App\Models\Plan;
use App\Models\User;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * Una liquidación de sueldos "approved" es un corte administrativo — los
 * recibos que la componen no deberían recalcularse más, aunque cambien los
 * datos de base del empleado (sueldo, comisión, etc.) después. El status del
 * EmployeeReceipt individual sigue en 'draft' hasta que la liquidación pasa
 * a 'paid' (recién ahí PayrollRunController::update() lo marca), así que sin
 * un chequeo extra en EmployeePayrollService::syncReceipt() contra el status
 * de la liquidación padre, abrir la pantalla de un recibo individual
 * (EmployeeReceiptController::show()/pdf()) lo recalculaba igual.
 */
class PayrollRunApprovalLocksReceiptsTest extends TestCase
{
    use RefreshesTenantSchema;

    private Company $company;

    private User $staff;

    private Employee $employee;

    protected function setUp(): void
    {
        parent::setUp();

        $plan = Plan::where('slug', 'owner')->firstOrFail();
        $module = Module::firstOrCreate(['slug' => 'rrhh'], ['name' => 'RRHH']);
        $plan->modules()->syncWithoutDetaching([$module->id]);

        // TenantModuleResolver memoiza en una propiedad estática (además de
        // Redis/array cache) — si otro test corrió antes en el mismo proceso
        // PHP y ya resolvió los módulos del tenant 'owner' sin "rrhh", esa
        // memoria queda pegada para el resto del proceso. Cache::flush() no
        // alcanza porque $requestCache es un array estático, no pasa por el
        // store de cache — hace falta forget() explícito.
        app(\App\Support\TenantModuleResolver::class)->forget('owner');

        $this->company = Company::factory()->create();
        $this->staff = User::factory()->for($this->company)->create();
        $this->staff->givePermissionTo(
            Permission::findOrCreate('staff.view', 'web'),
            Permission::findOrCreate('staff.edit', 'web'),
            Permission::findOrCreate('rrhh.liquidaciones.run', 'web'),
            Permission::findOrCreate('rrhh.liquidaciones.approve', 'web'),
        );

        $employeeUser = User::factory()->for($this->company)->create();
        $this->employee = Employee::create([
            'company_id' => $this->company->id,
            'user_id' => $employeeUser->id,
            'salary' => 100000,
            'is_active' => true,
        ]);

        $this->actingAs($this->staff);
    }

    public function test_approving_a_payroll_run_freezes_its_receipts_against_recalculation(): void
    {
        $this->post(route('payroll-runs.store'), [
            'period_from' => '2026-08-01',
            'period_to' => '2026-08-31',
            'type' => 'mensual',
            'employee_ids' => [$this->employee->id],
        ])->assertRedirect();

        $run = PayrollRun::where('company_id', $this->company->id)->firstOrFail();
        $this->assertSame('calculated', $run->status);

        $receipt = EmployeeReceipt::where('payroll_run_id', $run->id)->firstOrFail();
        $this->assertEquals(100000.0, (float) $receipt->salary_gross);
        $this->assertEquals(100000.0, (float) $receipt->net);

        // Aprobar la liquidación.
        $this->put(route('payroll-runs.update', $run), ['status' => 'approved'])->assertRedirect();
        $run->refresh();
        $this->assertSame('approved', $run->status);

        // El recibo individual sigue 'draft' — es exactamente el estado que
        // syncReceipt() usaba como único gate antes de este fix.
        $receipt->refresh();
        $this->assertSame('draft', $receipt->status);

        // Cambia el sueldo del empleado DESPUÉS de aprobada la liquidación.
        $this->employee->update(['salary' => 500000]);

        // Abrir la pantalla del recibo no debe recalcularlo — la liquidación
        // ya está aprobada.
        $this->get(route('employee-receipts.show', $receipt))->assertOk();

        $receipt->refresh();
        $this->assertEquals(100000.0, (float) $receipt->salary_gross, 'El recibo se recalculó después de aprobada la liquidación.');
        $this->assertEquals(100000.0, (float) $receipt->net);
    }

    public function test_a_receipt_still_recalculates_while_its_run_is_only_calculated(): void
    {
        $this->post(route('payroll-runs.store'), [
            'period_from' => '2026-08-01',
            'period_to' => '2026-08-31',
            'type' => 'mensual',
            'employee_ids' => [$this->employee->id],
        ])->assertRedirect();

        $run = PayrollRun::where('company_id', $this->company->id)->firstOrFail();
        $receipt = EmployeeReceipt::where('payroll_run_id', $run->id)->firstOrFail();

        // Sin aprobar todavía: cambiar el sueldo y volver a abrir el recibo
        // SÍ debe reflejar el nuevo monto (control negativo — confirma que
        // el fix no bloquea de más).
        $this->employee->update(['salary' => 500000]);

        $this->get(route('employee-receipts.show', $receipt))->assertOk();

        $receipt->refresh();
        $this->assertEquals(500000.0, (float) $receipt->salary_gross);
    }
}
