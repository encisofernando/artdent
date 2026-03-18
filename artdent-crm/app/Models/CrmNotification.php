<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CrmNotification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'body',
        'url',
        'order_code',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }
}
