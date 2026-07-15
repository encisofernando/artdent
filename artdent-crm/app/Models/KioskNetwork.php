<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Mapea una IP o token de kiosco físico (fichaje, producción) a un tenant —
 * vive en la BD central porque los terminales pegan sin sesión/login, así
 * que hace falta resolver el tenant ANTES de poder conectarse a su base.
 * Ver App\Http\Middleware\RestrictToLabNetwork.
 */
class KioskNetwork extends Model
{
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'label',
        'ip_address',
        'token',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
