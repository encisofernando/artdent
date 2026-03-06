<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CouponUsage
 * 
 * @property int $id
 * @property int $coupon_id
 * @property int|null $customer_id
 * @property int|null $order_id
 * @property Carbon|null $used_at
 * 
 * @property Coupon $coupon
 *
 * @package App\Models
 */
class CouponUsage extends Model
{
	protected $table = 'coupon_usages';
	public $timestamps = false;

	protected $casts = [
		'coupon_id' => 'int',
		'customer_id' => 'int',
		'order_id' => 'int',
		'used_at' => 'datetime'
	];

	protected $fillable = [
		'coupon_id',
		'customer_id',
		'order_id',
		'used_at'
	];

	public function coupon()
	{
		return $this->belongsTo(Coupon::class);
	}
}
