<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcommerceOrderItem extends Model
{
    protected $table = 'ecommerce_order_items';

    protected $fillable = [
        'order_id',
        'product_id',
        'sku',
        'name',
        'qty',
        'unit_price',
        'tax_rate',
        'line_subtotal',
        'line_tax',
        'line_total',
    ];

    protected $casts = [
        'qty' => 'float',
        'unit_price' => 'float',
        'tax_rate' => 'float',
        'line_subtotal' => 'float',
        'line_tax' => 'float',
        'line_total' => 'float',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(EcommerceOrder::class, 'order_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
