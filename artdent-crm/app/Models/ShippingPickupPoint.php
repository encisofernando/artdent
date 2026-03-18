<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingPickupPoint extends Model
{
    protected $fillable = [
        'name',
        'address',
        'city',
        'province',
        'postal_code',
        'phone',
        'schedule',
        'latitude',
        'longitude',
        'notes',
        'is_active',
        'accepts_cash_payment',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'is_active' => 'boolean',
            'accepts_cash_payment' => 'boolean',
        ];
    }
}
