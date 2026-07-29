<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Mapea el Account ID que un terminal ISUP anuncia al registrarse contra el
 * isup-listener, hacia el tenant al que pertenece — vive en la BD central
 * porque el listener resuelve esto antes de poder inicializar la tenancy y
 * consultar la BD del tenant. Mismo criterio que KioskNetwork.
 */
class IsupDeviceRegistry extends Model
{
    protected $table = 'isup_device_registry';

    protected $connection = 'central';

    protected $fillable = [
        'account_id',
        'serial_no',
        'mac_address',
        'tenant_id',
        'device_id',
    ];
}
