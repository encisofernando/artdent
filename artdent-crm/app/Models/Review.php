<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Review
 * 
 * @property int $id
 * @property int $product_id
 * @property int|null $customer_id
 * @property int|null $order_id
 * @property int $rating
 * @property string|null $title
 * @property string|null $body
 * @property string|null $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Customer|null $customer
 * @property Product $product
 *
 * @package App\Models
 */
class Review extends Model
{
	protected $table = 'reviews';

	protected $casts = [
		'product_id' => 'int',
		'customer_id' => 'int',
		'order_id' => 'int',
		'rating' => 'int'
	];

	protected $fillable = [
		'product_id',
		'customer_id',
		'order_id',
		'rating',
		'title',
		'body',
		'status'
	];

	public function customer()
	{
		return $this->belongsTo(Customer::class);
	}

	public function product()
	{
		return $this->belongsTo(Product::class);
	}
}
