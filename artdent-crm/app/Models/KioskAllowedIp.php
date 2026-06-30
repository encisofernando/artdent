<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KioskAllowedIp extends Model
{
    protected $fillable = ['label', 'ip_address', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
