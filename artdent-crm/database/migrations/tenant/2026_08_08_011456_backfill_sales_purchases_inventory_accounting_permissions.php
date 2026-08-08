<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * sales/purchases/inventory/accounting.* se agregaron a sync_all_permissions
 * (2026_06_30_201000) DESPUÉS de que algunos tenants ya hubieran corrido esa
 * migración — como es un Migration (no un seeder repetible), esos tenants
 * (confirmado: pato, sanjose) nunca recibieron los permisos nuevos, ni
 * siquiera aparecían en el selector de Roles para poder asignarlos a mano.
 * Additivo: sólo crea los permisos que falten y se los da a Super Admin/Admin
 * (givePermissionTo, no syncPermissions) — no toca roles custom de cada
 * tenant (ej. "CAJERO"), esos se asignan a mano desde Roles.
 */
return new class extends Migration
{
    /** @var array<string, list<string>> */
    private const PERMISSIONS = [
        'sales' => ['view', 'create', 'edit', 'delete'],
        'purchases' => ['view', 'create', 'edit', 'delete'],
        'inventory' => ['view', 'create', 'edit', 'delete', 'manage'],
        'accounting' => ['view', 'create', 'edit', 'delete'],
    ];

    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $all = [];
        foreach (self::PERMISSIONS as $module => $actions) {
            foreach ($actions as $action) {
                $all[] = Permission::findOrCreate("{$module}.{$action}", 'web');
            }
        }

        foreach (['Super Admin', 'Admin'] as $roleName) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();

            if (! $role) {
                continue;
            }

            foreach ($all as $permission) {
                if (! $role->hasPermissionTo($permission)) {
                    $role->givePermissionTo($permission);
                }
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        // No revertimos: podrían ya estar en uso por roles custom de un
        // tenant (ej. CAJERO con sales.*) y borrar la fila de permission
        // rompería esa asignación real.
    }
};
