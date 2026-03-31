<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

/**
 * Class Role
 *
 * @property int $id
 * @property string $name
 * @property string|null $display_name
 * @property string|null $description
 * @property string $guard_name
 * @property \Carbon\Carbon|null $created_at
 * @property \Carbon\Carbon|null $updated_at
 */
class Role extends SpatieRole
{
    protected $fillable = [
        'name',
        'display_name',
        'description',
        'guard_name',
    ];
}
