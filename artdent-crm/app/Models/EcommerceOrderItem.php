<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class EcommerceOrderItem
 *
 * @property int $id
 * @property int $order_id
 * @property int|null $product_id
 * @property int|null $variant_id
 * @property string $product_name
 * @property string|null $sku
 * @property int $quantity
 * @property float $unit_price
 * @property float|null $discount
 * @property float $total
 * @property EcommerceOrder $ecommerce_order
 * @property Product|null $product
 */
class EcommerceOrderItem extends Model
{
    protected $table = 'ecommerce_order_items';

    public $timestamps = false;

    protected $casts = [
        'order_id' => 'int',
        'product_id' => 'int',
        'variant_id' => 'int',
        'quantity' => 'int',
        'unit_price' => 'float',
        'tax_rate' => 'float',
        'discount' => 'float',
        'total' => 'float',
    ];

    protected $fillable = [
        'order_id',
        'product_id',
        'variant_id',
        'product_name',
        'sku',
        'quantity',
        'unit_price',
        'tax_rate',
        'discount',
        'total',
    ];

    public function ecommerce_order()
    {
        return $this->belongsTo(EcommerceOrder::class, 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
