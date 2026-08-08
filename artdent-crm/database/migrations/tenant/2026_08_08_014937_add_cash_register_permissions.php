<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Separa "ver el contenido de la caja" de "operar la caja" (abrir/cerrar
 * a ciegas, sin ver montos ni historial) — antes ambas cosas compartían
 * reports.view/reports.create, no había forma de dar sólo una.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $view = Permission::findOrCreate('cash-register.view', 'web');
        $operate = Permission::findOrCreate('cash-register.operate', 'web');

        foreach (['Super Admin', 'Admin'] as $roleName) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();

            if (! $role) {
                continue;
            }

            foreach ([$view, $operate] as $permission) {
                if (! $role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        // No revertimos: podría ya estar en uso por roles custom de un tenant.
    }
};
