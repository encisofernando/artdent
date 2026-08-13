<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\Customer;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class CompanyIsolationTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware();
        $this->ensureTables();
    }

    public function test_regular_user_only_sees_customers_from_their_own_company(): void
    {
        $companyA = $this->makeCompany(['id' => 1]);
        $companyB = $this->makeCompany(['id' => 2]);

        $userA = $this->makeUser($companyA);

        $customerA = $this->makeCustomer($companyA, 'a@example.com');
        $customerB = $this->makeCustomer($companyB, 'b@example.com');

        $this->actingAs($userA);

        $visibleIds = Customer::query()->pluck('id');

        $this->assertTrue($visibleIds->contains($customerA->id));
        $this->assertFalse($visibleIds->contains($customerB->id));

        // Forzar acceso directo por ID (simula forzar la URL) tampoco debe resolver.
        $this->assertNull(Customer::find($customerB->id));
    }

    public function test_user_without_switch_permission_cannot_change_active_company(): void
    {
        $companyA = $this->makeCompany(['id' => 1]);
        $companyB = $this->makeCompany(['id' => 2]);

        $userA = $this->makeUser($companyA);
        $this->actingAs($userA);

        $this->expectException(HttpException::class);

        CompanyContext::set($companyB->id);
    }

    public function test_switch_capable_user_defaults_to_company_one_and_can_switch(): void
    {
        $companyOne = $this->makeCompany(['id' => 1]);
        $companyTwo = $this->makeCompany(['id' => 2]);

        $superadmin = $this->makeUser($companyOne, canSwitch: true);

        $this->makeCustomer($companyOne, 'c1@example.com');
        $customerTwo = $this->makeCustomer($companyTwo, 'c2@example.com');

        $this->actingAs($superadmin);

        // Sin haber elegido nada todavía, arranca en la company 1.
        $this->assertEquals(1, CompanyContext::id());
        $this->assertFalse(Customer::query()->pluck('id')->contains($customerTwo->id));

        CompanyContext::set($companyTwo->id);

        $this->assertEquals($companyTwo->id, CompanyContext::id());
        $this->assertTrue(Customer::query()->pluck('id')->contains($customerTwo->id));
    }

    public function test_creating_a_customer_assigns_the_currently_active_company(): void
    {
        $companyOne = $this->makeCompany(['id' => 1]);
        $companyThree = $this->makeCompany(['id' => 3]);

        $superadmin = $this->makeUser($companyOne, canSwitch: true);
        $this->actingAs($superadmin);

        CompanyContext::set($companyThree->id);

        // company_id deliberadamente omitido: debe completarlo el trait BelongsToCompany
        // a partir de la company activa (no de la company "dueña" del usuario).
        $customer = Customer::create(['name' => 'Nuevo cliente', 'email' => 'nuevo@example.com']);

        $this->assertEquals($companyThree->id, $customer->company_id);
    }

    public function test_guest_context_defaults_to_company_one(): void
    {
        $this->makeCompany(['id' => 1]);

        $this->assertEquals(1, CompanyContext::id());
    }

    /**
     * id no es mass-assignable en Company, así que para fijar ids
     * deterministicos en los fixtures (company 1, 2, 3...) lo seteamos
     * directo en el modelo antes de guardar.
     */
    protected function makeCompany(array $overrides = []): Company
    {
        // Este test fuerza IDs fijos (1, 2, 3 — importa para el default
        // de CompanyContext::DEFAULT_COMPANY_ID). Otro archivo de test
        // (BroadcastingAuthTest) usa la misma convención sobre la misma
        // DB real compartida — si su rollback no limpia a tiempo, choca.
        // Defensivo: borrar cualquier residuo antes de insertar (usuarios
        // primero — FK — y forceDelete porque User usa SoftDeletes, un
        // soft-delete no libera la fila para el FK de companies).
        if (isset($overrides['id'])) {
            \App\Models\User::withTrashed()->where('company_id', $overrides['id'])->forceDelete();
            Company::where('id', $overrides['id'])->delete();
        }

        $company = new Company(['name' => 'Company '.uniqid()]);

        foreach ($overrides as $key => $value) {
            $company->{$key} = $value;
        }

        $company->save();

        return $company;
    }

    protected function makeUser(Company $company, bool $canSwitch = false): User
    {
        $user = User::create([
            'company_id' => $company->id,
            'name' => 'Tester',
            'email' => 'tester+'.uniqid().'@example.com',
            'password' => Hash::make('password'),
        ]);

        if ($canSwitch) {
            $permission = Permission::findOrCreate('companies.switch', 'web');
            $user->givePermissionTo($permission);
        }

        return $user;
    }

    /**
     * company_id no es mass-assignable en Customer (se completa sólo vía el
     * trait BelongsToCompany), así que para fixtures de test lo seteamos
     * directo en el modelo antes de guardar.
     */
    protected function makeCustomer(Company $company, string $email): Customer
    {
        $customer = new Customer(['name' => 'Cliente', 'email' => $email]);
        $customer->company_id = $company->id;
        $customer->save();

        return $customer;
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

        if (! Schema::hasTable('customers')) {
            Schema::create('customers', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('name');
                $table->string('email')->unique();
                $table->string('password')->nullable();
                $table->string('portal_token')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });
        }

        if (! Schema::hasTable('permissions')) {
            (require database_path('migrations/tenant/2026_03_20_214122_create_permission_tables.php'))->up();
        }
    }
}
