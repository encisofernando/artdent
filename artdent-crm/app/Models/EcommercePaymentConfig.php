<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EcommercePaymentConfig extends Model
{
    protected $fillable = [
        'type',
        'label',
        'is_enabled',
        'config',
        'instructions',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
        ];
    }
}
