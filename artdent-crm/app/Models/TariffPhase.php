<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TariffPhase extends Model
{
    protected $fillable = [
        'tariff_id',
        'name',
        'price',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
            'sort_order' => 'int',
        ];
    }

    public function tariff(): BelongsTo
    {
        return $this->belongsTo(Tariff::class);
    }

    public function jobPhaseProgress(): HasMany
    {
        return $this->hasMany(JobPhaseProgress::class);
    }
}
