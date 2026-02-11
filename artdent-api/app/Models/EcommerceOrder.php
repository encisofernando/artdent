<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EcommerceOrder extends Model
{
    protected $table = 'ecommerce_orders';

    protected $fillable = [
        'company_id',
        'warehouse_id',
        'user_id',
        'code',
        'status',
        'pricing_mode',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'notes',
        'subtotal',
        'tax_total',
        'total',
        'currency',
    ];

    protected $casts = [
        'subtotal' => 'float',
        'tax_total' => 'float',
        'total' => 'float',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(EcommerceOrderItem::class, 'order_id');
    }
}
