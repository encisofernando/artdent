<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = collect(['view', 'create', 'edit', 'delete', 'manage'])
            ->map(fn (string $action) => Permission::findOrCreate("inventory.{$action}", 'web'));

        // Admin y Super Admin reciben todos los permisos de inventario
        foreach (['Admin', 'Super Admin'] as $roleName) {
            $role = Role::findByName($roleName, 'web');

            if ($role) {
                $role->givePermissionTo($permissions);
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        Permission::whereIn('name', [
            'inventory.view', 'inventory.create', 'inventory.edit',
            'inventory.delete', 'inventory.manage',
        ])->delete();
    }
};
