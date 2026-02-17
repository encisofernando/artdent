<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
        'action_url',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];
}
