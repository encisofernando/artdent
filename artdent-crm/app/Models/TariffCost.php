<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TariffCost extends Model
{
    use HasFactory;

    protected $fillable = [
        'tariff_id',
        'type',
        'description',
        'supplier',
        'unit',
        'unit_cost',
        'quantity',
        'margin_pct'
    ];

    protected $casts = [
        'unit_cost' => 'float',
        'quantity' => 'float',
        'margin_pct' => 'float'
    ];

    /**
     * Get the calculated total cost for this item (unit_cost * quantity).
     */
    public function getTotalCostAttribute()
    {
        return $this->unit_cost * $this->quantity;
    }

    /**
     * Get the suggested final price after applying the profit margin.
     */
    public function getSuggestedPriceAttribute()
    {
        $cost = $this->total_cost;
        return round($cost * (1 + ($this->margin_pct / 100)), 2);
    }

    public function tariff()
    {
        return $this->belongsTo(Tariff::class);
    }
}
