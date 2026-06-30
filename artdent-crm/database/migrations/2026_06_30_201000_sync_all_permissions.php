<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * Sync the complete permission matrix to the DB.
 * Uses findOrCreate — safe to run even if some permissions already exist.
 * Roles are updated with syncPermissions — existing extra permissions are removed.
 */
return new class extends Migration
{
    /** @var array<string, list<string>> */
    private const PERMISSIONS = [
        // ── Administración ────────────────────────────────────────────────────
        'users' => ['view', 'create', 'edit', 'delete'],
        'roles' => ['view', 'create', 'edit', 'delete'],
        'settings' => ['view', 'edit'],
        'branches' => ['view', 'create', 'edit', 'delete'],

        // ── Comercial ─────────────────────────────────────────────────────────
        'customers' => ['view', 'create', 'edit', 'delete'],
        'sales' => ['view', 'create', 'edit', 'delete'],
        'ecommerce' => ['view', 'create', 'edit', 'delete'],
        'purchases' => ['view', 'create', 'edit', 'delete'],

        // ── Producción ────────────────────────────────────────────────────────
        'products' => ['view', 'create', 'edit', 'delete'],
        'orders' => ['view', 'create', 'edit', 'delete'],

        // ── Almacén / Inventario ──────────────────────────────────────────────
        'inventory' => ['view', 'create', 'edit', 'delete', 'manage'],

        // ── Personal ──────────────────────────────────────────────────────────
        'staff' => ['view', 'create', 'edit', 'delete'],

        // ── Finanzas ──────────────────────────────────────────────────────────
        'accounting' => ['view', 'create', 'edit', 'delete'],
        'reports' => ['view'],
    ];

    /** @var array<string, list<string>> */
    private const ROLE_PERMISSIONS = [
        'Super Admin' => '*',
        'Admin' => '*',

        'Colaborador' => [
            'orders.view', 'orders.create', 'orders.edit',
            'products.view',
            'inventory.view',
            'reports.view',
        ],

        'Vendedor' => [
            'sales.view', 'sales.create', 'sales.edit',
            'ecommerce.view', 'ecommerce.create', 'ecommerce.edit',
            'customers.view', 'customers.create', 'customers.edit',
            'products.view',
            'reports.view',
        ],

        'Logística' => [
            'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.manage',
            'products.view', 'products.edit',
            'purchases.view', 'purchases.create',
            'branches.view',
            'ecommerce.view',
            'reports.view',
        ],

        'Recepción' => [
            'customers.view', 'customers.create', 'customers.edit',
            'orders.view', 'orders.create',
            'sales.view', 'sales.create',
        ],

        'Contador' => [
            'accounting.view', 'accounting.create', 'accounting.edit',
            'reports.view',
        ],
    ];

    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Ensure all permissions exist
        $all = [];
        foreach (self::PERMISSIONS as $module => $actions) {
            foreach ($actions as $action) {
                $name = "{$module}.{$action}";
                Permission::findOrCreate($name, 'web');
                $all[] = $name;
            }
        }

        // 2. Sync roles that already exist (don't create new roles here)
        foreach (self::ROLE_PERMISSIONS as $roleName => $perms) {
            $role = Role::where('name', $roleName)->where('guard_name', 'web')->first();

            if (! $role) {
                continue;
            }

            $role->syncPermissions($perms === '*' ? $all : $perms);
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    public function down(): void
    {
        // Permissions are additive — down() only removes the newly added modules
        // to avoid breaking other roles that might rely on shared permissions.
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $newModules = ['sales', 'purchases'];

        foreach ($newModules as $module) {
            Permission::where('name', 'like', "{$module}.%")->delete();
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }
};
