<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * companies.switch nunca se sembró para tenants existentes (sólo se creaba
 * con findOrCreate en tests). Es additivo: usa givePermissionTo, no
 * syncPermissions, para no tocar el resto de los permisos de los roles.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::findOrCreate('companies.switch', 'web');

        foreach (['Super Admin', 'Admin'] as $roleName) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();

            if ($role && ! $role->hasPermissionTo($permission)) {
                $role->givePermissionTo($permission);
            }
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
        Permission::where('name', 'companies.switch')->delete();
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
