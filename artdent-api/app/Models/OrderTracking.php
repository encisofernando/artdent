<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderTracking extends Model
{
    protected $table = 'order_tracking';

    protected $fillable = [
        'order_id',
        'status',
        'notes',
        'location',
        'estimated_delivery',
        'carrier',
        'tracking_number',
        'tracking_url',
        'updated_by_user_id',
        'notification_sent',
    ];

    protected $casts = [
        'estimated_delivery' => 'datetime',
        'notification_sent' => 'boolean',
    ];
}
