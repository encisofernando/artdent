<?php

namespace App\Observers;

use App\Models\HikVisionDevice;
use App\Support\CrmMode;
use Illuminate\Support\Facades\DB;

/**
 * Mantiene isup_device_registry (BD central) en sincronía con los
 * HikVisionDevice de tipo ISUP de cada tenant — el isup-listener necesita
 * resolver "a qué tenant pertenece este account_id" antes de poder
 * inicializar la tenancy, así que esa tabla no puede vivir en la BD del
 * tenant. Mismo patrón que UserObserver con user_tenant_map.
 */
class HikVisionDeviceObserver
{
    private function centralConnection(): \Illuminate\Database\Connection
    {
        return DB::connection(config('tenancy.database.central_connection'));
    }

    private function currentTenantId(): ?string
    {
        if (CrmMode::isOwner() || ! function_exists('tenant') || ! tenancy()->initialized) {
            return null;
        }

        return tenant('id');
    }

    public function saved(HikVisionDevice $device): void
    {
        if (! $tenantId = $this->currentTenantId()) {
            return;
        }

        if ($device->connection_type !== 'isup' || ! $device->isup_account_id) {
            // Si dejó de ser ISUP (cambió el tipo o le borraron el account_id),
            // no debe quedar un mapeo central apuntando a un dispositivo que ya
            // no lo usa.
            $this->centralConnection()->table('isup_device_registry')
                ->where('tenant_id', $tenantId)
                ->where('device_id', $device->id)
                ->delete();

            return;
        }

        // isup_account_id se genera una sola vez y no es editable desde la UI,
        // pero por las dudas se limpia cualquier fila vieja de este mismo
        // dispositivo con otro account_id antes de escribir la actual.
        $this->centralConnection()->table('isup_device_registry')
            ->where('tenant_id', $tenantId)
            ->where('device_id', $device->id)
            ->where('account_id', '!=', $device->isup_account_id)
            ->delete();

        // serial_no/mac_address se copian acá porque el listener real
        // (HCNetSDK) identifica al terminal que se conecta por esos campos
        // (NET_DVR_ALARMER), no necesariamente por el account_id — ver
        // docs/hikvision-isup-arquitectura.md § 5. Quedan null hasta que el
        // dispositivo se conecte al menos una vez y IsupIngestController los
        // complete (lo que dispara este mismo observer de nuevo).
        $this->centralConnection()->table('isup_device_registry')->updateOrInsert(
            ['account_id' => $device->isup_account_id],
            [
                'tenant_id' => $tenantId,
                'device_id' => $device->id,
                'serial_no' => $device->serial_no,
                'mac_address' => $device->mac_address,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function deleted(HikVisionDevice $device): void
    {
        if (! $tenantId = $this->currentTenantId()) {
            return;
        }

        $this->centralConnection()->table('isup_device_registry')
            ->where('tenant_id', $tenantId)
            ->where('device_id', $device->id)
            ->delete();
    }
}
