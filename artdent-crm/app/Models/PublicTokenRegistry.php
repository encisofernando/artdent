<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Mapea un token público (Invoice.public_token de presupuestos, o
 * Customer.portal_token del portal de clientes) hacia el tenant al que
 * pertenece — vive en la BD central porque las rutas /q/{token} y
 * /portal/{token} son públicas (sin sesión de staff) y necesitan resolver
 * esto antes de poder inicializar la tenancy. Análogo a IsupDeviceRegistry.
 */
class PublicTokenRegistry extends Model
{
    protected $table = 'public_token_registry';

    protected $connection = 'central';

    protected $fillable = [
        'token',
        'type',
        'tenant_id',
    ];
}
