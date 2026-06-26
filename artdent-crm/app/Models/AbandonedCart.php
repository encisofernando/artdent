<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbandonedCart extends Model
{
    protected $table = 'ecommerce_abandoned_carts';

    protected $fillable = [
        'company_id',
        'email',
        'cart_json',
        'notified_at',
        'recovered_at',
    ];

    protected function casts(): array
    {
        return [
            'cart_json' => 'array',
            'notified_at' => 'datetime',
            'recovered_at' => 'datetime',
        ];
    }
}
