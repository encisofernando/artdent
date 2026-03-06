<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class PurchaseItem
 * 
 * @property int $id
 * @property int $purchase_id
 * @property int $product_id
 * @property int|null $variant_id
 * @property float $quantity
 * @property float $unit_cost
 * @property float $total
 * @property float|null $received_qty
 * 
 * @property Product $product
 * @property Purchase $purchase
 *
 * @package App\Models
 */
class PurchaseItem extends Model
{
	protected $table = 'purchase_items';
	public $timestamps = false;

	protected $casts = [
		'purchase_id' => 'int',
		'product_id' => 'int',
		'variant_id' => 'int',
		'quantity' => 'float',
		'unit_cost' => 'float',
		'total' => 'float',
		'received_qty' => 'float'
	];

	protected $fillable = [
		'purchase_id',
		'product_id',
		'variant_id',
		'quantity',
		'unit_cost',
		'total',
		'received_qty'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}

	public function purchase()
	{
		return $this->belongsTo(Purchase::class);
	}
}
