<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NaveInstallmentRate extends Model
{
    protected $fillable = [
        'bank',
        'card_brand',
        'card_type',
        'installments',
        'rate_pct',
        'tier_label',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'installments' => 'integer',
            'rate_pct' => 'float',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
