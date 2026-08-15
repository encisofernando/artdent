<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Mapea IP/MAC/serial que un terminal HikVision anuncia al pushear un evento
 * ISAPI a hikvision/webhook, hacia el tenant al que pertenece — vive en la BD
 * central porque HikVisionWebhookController resuelve esto antes de poder
 * inicializar la tenancy y consultar la BD del tenant. Análogo a
 * IsupDeviceRegistry, para el transporte ISAPI en vez de ISUP.
 */
class IsapiDeviceRegistry extends Model
{
    protected $table = 'isapi_device_registry';

    protected $connection = 'central';

    protected $fillable = [
        'ip_address',
        'mac_address',
        'serial_no',
        'tenant_id',
        'device_id',
    ];
}
