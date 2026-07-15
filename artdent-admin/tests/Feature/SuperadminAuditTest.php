<?php

namespace Tests\Feature;

use App\Models\SuperadminAuditLog;
use App\Models\Tenant;
use App\Models\User;
use App\Support\SuperadminAudit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * No se instancia un Tenant real vía Tenant::create() acá: eso dispara el
 * ciclo de eventos de stancl/tenancy (creación física de la base del
 * tenant) contra la conexión 'mysql' real, aunque el resto de los tests
 * corra contra sqlite in-memory. Un Tenant sin guardar (sólo con id/name en
 * memoria) alcanza para probar SuperadminAudit::log(), que sólo lee esos
 * dos atributos — no necesita el modelo persistido.
 */
class SuperadminAuditTest extends TestCase
{
    use RefreshDatabase;

    public function test_logs_actor_and_tenant_snapshot(): void
    {
        $user = User::factory()->create(['email' => 'admin@example.com']);
        $tenant = new Tenant;
        $tenant->id = 'acme';
        $tenant->name = 'Acme Dental';

        $this->actingAs($user);

        SuperadminAudit::log('tenant.suspended', $tenant, ['reason' => 'falta de pago'], 'nota de prueba');

        $this->assertDatabaseHas('superadmin_audit_logs', [
            'actor_id' => $user->id,
            'actor_email' => 'admin@example.com',
            'action' => 'tenant.suspended',
            'tenant_id' => 'acme',
            'tenant_name' => 'Acme Dental',
            'note' => 'nota de prueba',
        ]);

        $log = SuperadminAuditLog::first();
        $this->assertEquals(['reason' => 'falta de pago'], $log->changes);
    }

    public function test_logs_without_a_tenant_or_authenticated_user(): void
    {
        SuperadminAudit::log('tenant.created');

        $this->assertDatabaseHas('superadmin_audit_logs', [
            'action' => 'tenant.created',
            'actor_id' => null,
            'tenant_id' => null,
        ]);
    }
}
