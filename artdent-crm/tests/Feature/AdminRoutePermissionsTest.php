<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Tests\Concerns\RefreshesTenantSchema;
use Tests\TestCase;

/**
 * Regresión de la Fase 1 del plan de remediación (auditoría 12/08/2026):
 * varias rutas de admin.php podían ser ejecutadas por CUALQUIER usuario
 * autenticado, sin importar su rol — incluida cancelar la suscripción SaaS
 * completa del tenant. Este test prueba que el middleware de permiso
 * realmente bloquea, no que la acción en sí funcione (eso requeriría mockear
 * Mercado Pago/AFIP, fuera de alcance acá).
 */
class AdminRoutePermissionsTest extends TestCase
{
    use RefreshesTenantSchema;

    public function test_user_without_settings_permission_cannot_cancel_subscription(): void
    {
        config(['crm.mode' => 'owner', 'crm.billing_enabled' => true]);

        $user = $this->makeUserWithPermissions([]);

        $response = $this->actingAs($user)->post('/subscription/cancel');

        $response->assertForbidden();
    }

    public function test_user_without_settings_permission_cannot_run_storage_link(): void
    {
        $user = $this->makeUserWithPermissions([]);

        $response = $this->actingAs($user)->post('/admin/storage-link');

        $response->assertForbidden();
    }

    public function test_user_without_purchases_permission_cannot_create_vendor(): void
    {
        $user = $this->makeUserWithPermissions([]);

        $response = $this->actingAs($user)->post('/vendors', ['name' => 'Proveedor Test']);

        $response->assertForbidden();
    }

    public function test_user_with_settings_permission_is_not_blocked_by_the_gate(): void
    {
        $user = $this->makeUserWithPermissions(['settings.edit']);

        $response = $this->actingAs($user)->post('/admin/storage-link');

        // No 403: pasa el gate de permiso y llega al controller (el
        // symlink real se crea o falla según el entorno, no es lo que
        // este test verifica).
        $response->assertStatus(302);
        $response->assertSessionMissing('errors');
    }

    protected function makeUserWithPermissions(array $permissions): User
    {
        $company = Company::create(['name' => 'Company '.uniqid()]);

        $user = User::create([
            'company_id' => $company->id,
            'name' => 'Tester',
            'email' => 'tester+'.uniqid().'@example.com',
            'password' => Hash::make('password'),
        ]);

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission, 'web'));
        }

        return $user;
    }
}
