<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class SaleReturnItem
 *
 * @property int $id
 * @property int $sale_return_id
 * @property int $sale_item_id
 * @property float $quantity
 * @property float $unit_price
 * @property float $total
 * @property SaleReturn $sale_return
 * @property SaleItem $sale_item
 */
class SaleReturnItem extends Model
{
    protected $table = 'sale_return_items';

    protected $casts = [
        'sale_return_id' => 'int',
        'sale_item_id' => 'int',
        'quantity' => 'float',
        'unit_price' => 'float',
        'total' => 'float',
    ];

    protected $fillable = [
        'sale_return_id',
        'sale_item_id',
        'quantity',
        'unit_price',
        'total',
    ];

    public function sale_return(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }

    public function sale_item(): BelongsTo
    {
        return $this->belongsTo(SaleItem::class);
    }
}
