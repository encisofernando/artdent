<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class EcommerceOrder
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $customer_id
 * @property int|null $coupon_id
 * @property int|null $shipping_method_id
 * @property string $order_number
 * @property string|null $status
 * @property string|null $payment_status
 * @property float|null $subtotal
 * @property float|null $discount_amount
 * @property float|null $shipping_cost
 * @property float|null $tax_amount
 * @property float|null $total
 * @property string|null $shipping_name
 * @property string|null $shipping_address
 * @property string|null $shipping_city
 * @property string|null $shipping_province
 * @property string|null $shipping_postal
 * @property string|null $shipping_phone
 * @property string|null $customer_notes
 * @property string|null $admin_notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Company $company
 * @property Coupon|null $coupon
 * @property Customer|null $customer
 * @property Collection|EcommerceOrderItem[] $ecommerce_order_items
 * @property Collection|Shipment[] $shipments
 */
class EcommerceOrder extends Model
{
    protected $table = 'ecommerce_orders';

    protected $casts = [
        'company_id' => 'int',
        'customer_id' => 'int',
        'coupon_id' => 'int',
        'shipping_method_id' => 'int',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'shipping_cost' => 'float',
        'tax_amount' => 'float',
        'total' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'customer_id',
        'coupon_id',
        'shipping_method_id',
        'shipping_method_type',
        'pickup_point_id',
        'moto_company_id',
        'order_number',
        'status',
        'payment_status',
        'subtotal',
        'discount_amount',
        'shipping_cost',
        'tax_amount',
        'total',
        'shipping_name',
        'shipping_address',
        'shipping_city',
        'shipping_province',
        'shipping_postal',
        'shipping_phone',
        'customer_notes',
        'admin_notes',
        'selected_payment_method',
        'mp_payment_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function ecommerce_order_items()
    {
        return $this->hasMany(EcommerceOrderItem::class, 'order_id');
    }

    public function shipments()
    {
        return $this->hasMany(Shipment::class, 'order_id');
    }
}
