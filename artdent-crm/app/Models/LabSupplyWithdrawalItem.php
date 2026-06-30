<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class LabSupplyWithdrawalItem
 *
 * @property int $id
 * @property int $withdrawal_id
 * @property int $product_id
 * @property int|null $variant_id
 * @property float $quantity
 * @property float $unit_cost
 * @property float $total
 * @property LabSupplyWithdrawal $withdrawal
 * @property Product $product
 * @property ProductVariant|null $variant
 */
class LabSupplyWithdrawalItem extends Model
{
    protected $table = 'lab_supply_withdrawal_items';

    protected $casts = [
        'withdrawal_id' => 'int',
        'product_id' => 'int',
        'variant_id' => 'int',
        'quantity' => 'float',
        'unit_cost' => 'float',
        'total' => 'float',
    ];

    protected $fillable = [
        'withdrawal_id',
        'product_id',
        'variant_id',
        'quantity',
        'unit_cost',
        'total',
    ];

    public function withdrawal(): BelongsTo
    {
        return $this->belongsTo(LabSupplyWithdrawal::class, 'withdrawal_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
