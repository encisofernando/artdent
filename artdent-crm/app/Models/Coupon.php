<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Coupon
 * 
 * @property int $id
 * @property string $code
 * @property string|null $type
 * @property float $value
 * @property float|null $min_order_amount
 * @property int|null $max_uses
 * @property int|null $used_count
 * @property int|null $max_uses_per_customer
 * @property Carbon|null $valid_from
 * @property Carbon|null $valid_until
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|CouponUsage[] $coupon_usages
 * @property Collection|EcommerceOrder[] $ecommerce_orders
 *
 * @package App\Models
 */
class Coupon extends Model
{
	protected $table = 'coupons';

	protected $casts = [
		'value' => 'float',
		'min_order_amount' => 'float',
		'max_uses' => 'int',
		'used_count' => 'int',
		'max_uses_per_customer' => 'int',
		'valid_from' => 'datetime',
		'valid_until' => 'datetime',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'code',
		'type',
		'value',
		'min_order_amount',
		'max_uses',
		'used_count',
		'max_uses_per_customer',
		'valid_from',
		'valid_until',
		'is_active'
	];

	public function coupon_usages()
	{
		return $this->hasMany(CouponUsage::class);
	}

	public function ecommerce_orders()
	{
		return $this->hasMany(EcommerceOrder::class);
	}
}
