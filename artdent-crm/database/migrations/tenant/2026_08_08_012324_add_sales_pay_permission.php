<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

/**
 * sales.pay: cobrar un saldo pendiente sobre una venta ya existente
 * (SaleController::pay / NavePosPaymentController::createForSale).
 * Antes esto compartía permission:sales.edit con editar/eliminar la venta
 * y con emitir Nota de Crédito/Débito (SaleReturnController) — no había
 * forma de darle a un rol tipo "cajero" la posibilidad de cobrar sin
 * también darle edición/devoluciones. Las rutas ya aceptan
 * `sales.edit|sales.pay` (ver routes/modules/sales.php), así que roles
 * con sales.edit siguen pudiendo cobrar sin cambios.
 */
return new class extends Migration
{
    public function up(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permission = Permission::findOrCreate('sales.pay', 'web');

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
        // No revertimos: podría ya estar en uso por roles custom (ej. CAJERO).
    }
};
