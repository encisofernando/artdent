<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantModule extends Model
{
    // Siempre consulta la BD central, aunque haya tenancy inicializado.
    protected $connection = 'central';

    protected $fillable = [
        'tenant_id',
        'module_id',
        'enabled',
        'expires_at',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }
}
