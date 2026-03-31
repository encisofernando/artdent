<?php

namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

/**
 * Class Permission
 *
 * @property int $id
 * @property string $name
 * @property string $guard_name
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Permission extends SpatiePermission
{
    protected $fillable = [
        'name',
        'guard_name',
    ];
}
