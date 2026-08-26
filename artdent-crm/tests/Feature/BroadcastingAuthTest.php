<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Tests\TestCase;

/**
 * Verifica el fix de seguridad de canales de la Fase 1: los closures de
 * routes/channels.php nunca deben confiar en los segmentos {tenantId}/
 * {companyId} del nombre del canal, sino resolverlos del lado del servidor
 * y comparar. CRM_MODE=owner se usa acá para tener un tenant_id
 * determinístico sin depender de tenancy()/stancl en el entorno de test.
 */
class BroadcastingAuthTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();

        $this->ensureTables();
        $this->withoutMiddleware(ValidateCsrfToken::class);

        config(['crm.mode' => 'owner', 'crm.owner_tenant.id' => 'owner']);

        // phpunit.xml fuerza BROADCAST_CONNECTION=null para no pegarle a
        // Reverb real durante el resto de la suite — pero el NullBroadcaster
        // ni siquiera llama a los closures de routes/channels.php (auth() es
        // un no-op), así que este test necesita un driver real (pusher/reverb)
        // para ejercitar la lógica de autorización que se está verificando.
        // routes/channels.php ya se cargó una vez al boot de la app contra el
        // driver 'null' (registrando los patrones ahí, no en 'reverb'), así
        // que hay que volver a requerirlo después de cambiar el driver activo.
        config(['broadcasting.default' => 'reverb']);
        require base_path('routes/channels.php');
    }

    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->post('/broadcasting/auth', [
            'channel_name' => 'private-tenant.owner.notifications',
            'socket_id' => '1234.5678',
        ]);

        $response->assertRedirect();
    }

    public function test_user_can_authenticate_to_their_own_tenant_notifications_channel(): void
    {
        $company = $this->makeCompany(['id' => 1]);
        $user = $this->makeUser($company);

        $response = $this->actingAs($user)->post('/broadcasting/auth', [
            'channel_name' => 'private-tenant.owner.notifications',
            'socket_id' => '1234.5678',
        ]);

        $response->assertOk();
    }

    public function test_user_cannot_authenticate_to_a_different_tenant_notifications_channel(): void
    {
        $this->withoutExceptionHandling();
        $this->expectException(AccessDeniedHttpException::class);

        $company = $this->makeCompany(['id' => 1]);
        $user = $this->makeUser($company);

        $this->actingAs($user)->post('/broadcasting/auth', [
            'channel_name' => 'private-tenant.otro-tenant-falso.notifications',
            'socket_id' => '1234.5678',
        ]);
    }

    public function test_user_can_authenticate_to_an_order_channel_for_an_order_that_belongs_to_their_company(): void
    {
        $company = $this->makeCompany(['id' => 1]);
        $user = $this->makeUser($company);
        $orderId = $this->makeOrder($company);

        $response = $this->actingAs($user)->post('/broadcasting/auth', [
            'channel_name' => "private-tenant.owner.company.{$company->id}.orders.{$orderId}",
            'socket_id' => '1234.5678',
        ]);

        $response->assertOk();
    }

    public function test_user_cannot_authenticate_to_an_order_channel_for_an_order_from_another_company(): void
    {
        $this->withoutExceptionHandling();
        $this->expectException(AccessDeniedHttpException::class);

        $companyOne = $this->makeCompany(['id' => 1]);
        $companyTwo = $this->makeCompany(['id' => 2]);
        $user = $this->makeUser($companyOne);
        $foreignOrderId = $this->makeOrder($companyTwo);

        $this->actingAs($user)->post('/broadcasting/auth', [
            'channel_name' => "private-tenant.owner.company.{$companyOne->id}.orders.{$foreignOrderId}",
            'socket_id' => '1234.5678',
        ]);
    }

    protected function makeCompany(array $overrides = []): Company
    {
        // IDs fijos (importa para CompanyContext::DEFAULT_COMPANY_ID) —
        // CompanyIsolationTest usa la misma convención sobre la misma DB
        // real compartida; defensivo por si un rollback anterior no
        // llegó a limpiar a tiempo. Usuarios primero (FK) y forceDelete
        // porque User usa SoftDeletes (un soft-delete no libera la fila).
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

    protected function makeUser(Company $company): User
    {
        return User::create([
            'company_id' => $company->id,
            'name' => 'Tester',
            'email' => 'tester+'.uniqid().'@example.com',
            'password' => Hash::make('password'),
        ]);
    }

    protected function makeOrder(Company $company): int
    {
        // 'order_number' es NOT NULL/UNIQUE en el schema real (tabla ya
        // existía antes de correr esto, no en el mini-schema de abajo).
        return DB::table('ecommerce_orders')->insertGetId([
            'company_id' => $company->id,
            'order_number' => 'TEST-'.uniqid(),
            'status' => 'pending',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
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

        if (! Schema::hasTable('ecommerce_orders')) {
            Schema::create('ecommerce_orders', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
                $table->string('status')->default('pending');
                $table->timestamps();
            });
        }

        if (! Schema::hasTable('permissions')) {
            (require database_path('migrations/tenant/2026_03_20_214122_create_permission_tables.php'))->up();
        }
    }
}
