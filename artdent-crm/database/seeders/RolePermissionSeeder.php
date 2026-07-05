<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Permission matrix.
     * Format: 'module' => ['action', ...]
     * Naming convention: module.action
     */
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
        // manage: ajustes manuales, transferencias, retiros de insumos
        'inventory' => ['view', 'create', 'edit', 'delete', 'manage'],

        // ── Personal ──────────────────────────────────────────────────────────
        'staff' => ['view', 'create', 'edit', 'delete'],

        // ── RRHH ──────────────────────────────────────────────────────────────
        // El resto de RRHH (legajo, recibos, extras, descuentos) reutiliza los
        // permisos staff.* existentes por ser el mismo recurso Employee.
        'rrhh' => ['organigrama.manage', 'convenios.manage', 'formulas.manage', 'liquidaciones.run', 'liquidaciones.approve', 'leaves.approve', 'medical.manage', 'evaluations.manage', 'trainings.manage'],

        // ── Finanzas ──────────────────────────────────────────────────────────
        'accounting' => ['view', 'create', 'edit', 'delete'],
        'reports' => ['view'],
    ];

    /**
     * Role definitions.
     * permissions key accepts exact permission names (module.action).
     */
    private function roles(): array
    {
        $all = $this->allPermissionNames();

        return [
            [
                'name' => 'Super Admin',
                'display_name' => 'Super Administrador',
                'description' => 'Acceso total e irrestricto a todos los módulos y configuraciones del sistema.',
                'permissions' => $all,
            ],
            [
                'name' => 'Admin',
                'display_name' => 'Administrador',
                'description' => 'Gestión operativa completa de la clínica, usuarios y reportes.',
                'permissions' => $all,
            ],
            [
                'name' => 'Colaborador',
                'display_name' => 'Técnico Colaborador',
                'description' => 'Acceso a la gestión de órdenes de trabajo, productos e inventario de lectura.',
                'permissions' => [
                    'orders.view', 'orders.create', 'orders.edit',
                    'products.view',
                    'inventory.view',
                    'reports.view',
                ],
            ],
            [
                'name' => 'Vendedor',
                'display_name' => 'Vendedor / Comercial',
                'description' => 'Gestión de ventas, presupuestos, e-commerce y catálogo de productos.',
                'permissions' => [
                    'sales.view', 'sales.create', 'sales.edit',
                    'ecommerce.view', 'ecommerce.create', 'ecommerce.edit',
                    'customers.view', 'customers.create', 'customers.edit',
                    'products.view',
                    'reports.view',
                ],
            ],
            [
                'name' => 'Logística',
                'display_name' => 'Encargado de Logística',
                'description' => 'Control de stock, almacén, retiros de insumos, compras y sucursales.',
                'permissions' => [
                    'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.manage',
                    'products.view', 'products.edit',
                    'purchases.view', 'purchases.create',
                    'branches.view',
                    'ecommerce.view',
                    'reports.view',
                ],
            ],
            [
                'name' => 'Recepción',
                'display_name' => 'Receptoría / Turnos',
                'description' => 'Atención al cliente, alta de órdenes básicas y registro de ventas mostrador.',
                'permissions' => [
                    'customers.view', 'customers.create', 'customers.edit',
                    'orders.view', 'orders.create',
                    'sales.view', 'sales.create',
                ],
            ],
            [
                'name' => 'Contador',
                'display_name' => 'Contador / Estudio Contable',
                'description' => 'Acceso al módulo contable, libros fiscales, facturación consolidada y reportes impositivos.',
                'permissions' => [
                    'accounting.view', 'accounting.create', 'accounting.edit',
                    'reports.view',
                ],
            ],
            [
                'name' => 'RRHH Admin',
                'display_name' => 'Administrador de RRHH',
                'description' => 'Gestión completa de legajos, organigrama y liquidación de personal.',
                'permissions' => [
                    'staff.view', 'staff.create', 'staff.edit', 'staff.delete',
                    'rrhh.organigrama.manage',
                    'rrhh.convenios.manage',
                    'rrhh.formulas.manage',
                    'rrhh.liquidaciones.run',
                    'rrhh.liquidaciones.approve',
                    'rrhh.leaves.approve',
                    'rrhh.medical.manage',
                    'rrhh.evaluations.manage',
                    'rrhh.trainings.manage',
                    'reports.view',
                ],
            ],
        ];
    }

    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Create all permissions (idempotent)
        foreach (self::PERMISSIONS as $module => $actions) {
            foreach ($actions as $action) {
                Permission::findOrCreate("{$module}.{$action}", 'web');
            }
        }

        // 2. Create / update roles and sync their permission sets
        foreach ($this->roles() as $data) {
            $role = Role::updateOrCreate(
                ['name' => $data['name'], 'guard_name' => 'web'],
                [
                    'display_name' => $data['display_name'],
                    'description' => $data['description'],
                ],
            );

            $role->syncPermissions($data['permissions']);
        }

        // 3. Ensure the first user has Super Admin
        $firstUser = User::first();
        if ($firstUser && ! $firstUser->hasRole('Super Admin')) {
            $firstUser->assignRole('Super Admin');
        }

        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
    }

    private function allPermissionNames(): array
    {
        $names = [];
        foreach (self::PERMISSIONS as $module => $actions) {
            foreach ($actions as $action) {
                $names[] = "{$module}.{$action}";
            }
        }

        return $names;
    }
}
