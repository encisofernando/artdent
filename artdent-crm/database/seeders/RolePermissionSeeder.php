<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Define Modules and Actions
        $modules = [
            'users' => 'Usuarios',
            'roles' => 'Roles y Permisos',
            'settings' => 'Configuración',
            'customers' => 'Clientes',
            'products' => 'Productos e Inventario',
            'orders' => 'Órdenes (Laboratorio)',
            'ecommerce' => 'E-commerce / Ventas',
            'reports' => 'Reportes y Estadísticas',
            'branches' => 'Sucursales',
            'staff' => 'Personal y RRHH',
            'accounting' => 'Contable y Fiscal',
        ];

        $actions = [
            'view' => 'Visualizar',
            'create' => 'Crear',
            'edit' => 'Editar',
            'delete' => 'Eliminar',
        ];

        // 2. Create Permissions
        $allPermissionNames = [];
        foreach ($modules as $moduleKey => $moduleLabel) {
            foreach ($actions as $actionKey => $actionLabel) {
                $permissionName = "{$moduleKey}.{$actionKey}";
                Permission::findOrCreate($permissionName, 'web');
                $allPermissionNames[] = $permissionName;
            }
        }

        // 2. Create Roles and Assign Permissions

        $rolesData = [
            [
                'name' => 'Super Admin',
                'display_name' => 'Super Administrador',
                'description' => 'Acceso total e irrestricto a todos los módulos y configuraciones del sistema.',
                'permissions' => $allPermissionNames,
            ],
            [
                'name' => 'Admin',
                'display_name' => 'Administrador',
                'description' => 'Gestión operativa completa de la clínica, usuarios y reportes.',
                'permissions' => array_merge(
                    $allPermissionNames // For now, let's give Admin almost everything
                ),
            ],
            [
                'name' => 'Colaborador',
                'display_name' => 'Técnico Colaborador',
                'description' => 'Acceso a la gestión de productos, inventario y órdenes de trabajo.',
                'permissions' => [
                    'products.view', 'products.edit',
                    'orders.view', 'orders.create', 'orders.edit',
                    'reports.view',
                ],
            ],
            [
                'name' => 'Vendedor',
                'display_name' => 'Vendedor / Comercial',
                'description' => 'Gestión de ventas e-commerce y catálogo de productos.',
                'permissions' => [
                    'ecommerce.view', 'ecommerce.create', 'ecommerce.edit',
                    'products.view', 'reports.view',
                ],
            ],
            [
                'name' => 'Logística',
                'display_name' => 'Encargado de Logística',
                'description' => 'Control de stock, sucursales y despacho de productos.',
                'permissions' => [
                    'products.view', 'products.edit',
                    'branches.view', 'ecommerce.view',
                ],
            ],
            [
                'name' => 'Recepción',
                'display_name' => 'Receptoría / Turnos',
                'description' => 'Atención al cliente y alta de órdenes básicas.',
                'permissions' => [
                    'customers.view', 'customers.create', 'customers.edit',
                    'orders.view', 'orders.create',
                ],
            ],
            [
                'name' => 'Contador',
                'display_name' => 'Contador / Estudio Contable',
                'description' => 'Acceso al módulo contable, libros fiscales, facturación consolidada y reportes impositivos.',
                'permissions' => [
                    'accounting.view',
                ],
            ],
        ];

        foreach ($rolesData as $data) {
            $role = Role::updateOrCreate(
                ['name' => $data['name'], 'guard_name' => 'web'],
                [
                    'display_name' => $data['display_name'],
                    'description' => $data['description'],
                ]
            );
            $role->syncPermissions($data['permissions']);
        }

        // 3. Assign Super Admin to the first user
        $firstUser = User::first();
        if ($firstUser) {
            if (! Role::where('name', 'Super Admin')->exists()) {
                // Should not happen as we just created it
            }
            $firstUser->assignRole('Super Admin');
        }
    }
}
