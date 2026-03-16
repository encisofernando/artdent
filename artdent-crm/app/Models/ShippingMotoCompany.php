<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMotoCompany extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'price',
        'zone',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'is_active' => 'boolean',
        ];
    }
}
