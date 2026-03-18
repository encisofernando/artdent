<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Shipment
 *
 * @property int $id
 * @property int $order_id
 * @property int|null $shipping_method_id
 * @property string|null $tracking_code
 * @property string|null $status
 * @property string|null $carrier
 * @property Carbon|null $shipped_at
 * @property Carbon|null $estimated_delivery
 * @property Carbon|null $delivered_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property ShippingMethod|null $shipping_method
 * @property EcommerceOrder $ecommerce_order
 */
class Shipment extends Model
{
    protected $table = 'shipments';

    protected $casts = [
        'order_id' => 'int',
        'shipping_method_id' => 'int',
        'shipped_at' => 'datetime',
        'estimated_delivery' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    protected $fillable = [
        'order_id',
        'shipping_method_id',
        'tracking_code',
        'tracking_url',
        'status',
        'carrier',
        'shipped_at',
        'estimated_delivery',
        'delivered_at',
        'notes',
    ];

    public function shipping_method()
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function ecommerce_order()
    {
        return $this->belongsTo(EcommerceOrder::class, 'order_id');
    }
}
