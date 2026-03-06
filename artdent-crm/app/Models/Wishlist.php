<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Wishlist
 * 
 * @property int $id
 * @property int $customer_id
 * @property int $product_id
 * @property Carbon|null $created_at
 * 
 * @property Customer $customer
 * @property Product $product
 *
 * @package App\Models
 */
class Wishlist extends Model
{
	protected $table = 'wishlists';
	public $timestamps = false;

	protected $casts = [
		'customer_id' => 'int',
		'product_id' => 'int'
	];

	protected $fillable = [
		'customer_id',
		'product_id'
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
