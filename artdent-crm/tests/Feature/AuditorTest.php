<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\User;
use App\Support\Auditor;
use App\Support\CompanyContext;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class AuditorTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ensureTables();
    }

    public function test_logs_actor_action_and_subject(): void
    {
        $company = $this->makeCompany();
        $user = $this->makeUser($company);
        $this->actingAs($user);

        Auditor::log('sale.cancelled', $user, ['reason' => 'cliente arrepentido'], 'nota de prueba');

        $this->assertDatabaseHas('audit_logs', [
            'company_id' => $company->id,
            'actor_id' => $user->id,
            'actor_name' => $user->name,
            'action' => 'sale.cancelled',
            'auditable_type' => User::class,
            'auditable_id' => $user->id,
            'note' => 'nota de prueba',
        ]);

        $log = AuditLog::first();
        $this->assertEquals(['reason' => 'cliente arrepentido'], $log->changes);
    }

    public function test_logs_are_isolated_per_company(): void
    {
        $companyA = $this->makeCompany();
        $companyB = $this->makeCompany();
        $userA = $this->makeUser($companyA);
        $userB = $this->makeUser($companyB);

        $this->actingAs($userA);
        Auditor::log('user.created', $userA);

        $this->actingAs($userB);
        Auditor::log('user.created', $userB);

        // Un usuario con permiso de switch es quien puede alternar la company
        // activa para leer los logs de cada una (mismo mecanismo que
        // CompanyIsolationTest usa para probar el aislamiento por company_id).
        $switcher = $this->makeUser($companyA, canSwitch: true);
        $this->actingAs($switcher);

        CompanyContext::set($companyA->id);
        $this->assertEquals(1, AuditLog::count());

        CompanyContext::set($companyB->id);
        $this->assertEquals(1, AuditLog::count());
    }

    public function test_logs_without_a_subject(): void
    {
        $company = $this->makeCompany();
        $user = $this->makeUser($company);
        $this->actingAs($user);

        Auditor::log('product.bulk_price_applied', null, ['affected_count' => 12]);

        $this->assertDatabaseHas('audit_logs', [
            'company_id' => $company->id,
            'action' => 'product.bulk_price_applied',
            'auditable_type' => null,
            'auditable_id' => null,
        ]);
    }

    protected function makeCompany(): Company
    {
        $company = new Company(['name' => 'Company '.uniqid()]);
        $company->save();

        return $company;
    }

    protected function makeUser(Company $company, bool $canSwitch = false): User
    {
        $user = User::create([
            'company_id' => $company->id,
            'name' => 'Tester '.uniqid(),
            'email' => 'tester+'.uniqid().'@example.com',
            'password' => Hash::make('password'),
        ]);

        if ($canSwitch) {
            $permission = \Spatie\Permission\Models\Permission::findOrCreate('companies.switch', 'web');
            $user->givePermissionTo($permission);
        }

        return $user;
    }

    protected function ensureTables(): void
    {
        if (! Schema::hasTable('companies')) {
            Schema::create('companies', function (Blueprint $table): void {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('users')) {
            Schema::create('users', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password');
                $table->rememberToken()->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('permissions')) {
            (require database_path('migrations/tenant/2026_03_20_214122_create_permission_tables.php'))->up();
        }

        if (! Schema::hasTable('audit_logs')) {
            Schema::create('audit_logs', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('actor_name')->nullable();
                $table->string('action');
                $table->string('auditable_type')->nullable();
                $table->unsignedBigInteger('auditable_id')->nullable();
                $table->json('changes')->nullable();
                $table->text('note')->nullable();
                $table->timestamps();
            });
        }
    }
}
