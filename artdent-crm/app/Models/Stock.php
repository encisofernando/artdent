<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Stock
 * 
 * @property int $id
 * @property int $product_id
 * @property int|null $variant_id
 * @property int $warehouse_id
 * @property float|null $quantity
 * @property float|null $min_quantity
 * @property Carbon|null $updated_at
 * 
 * @property Product $product
 * @property ProductVariant|null $product_variant
 * @property Warehouse $warehouse
 *
 * @package App\Models
 */
class Stock extends Model
{
	protected $table = 'stocks';
	public $timestamps = false;

	protected $casts = [
		'product_id' => 'int',
		'variant_id' => 'int',
		'warehouse_id' => 'int',
		'quantity' => 'float',
		'min_quantity' => 'float'
	];

	protected $fillable = [
		'product_id',
		'variant_id',
		'warehouse_id',
		'quantity',
		'min_quantity'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}

	public function product_variant()
	{
		return $this->belongsTo(ProductVariant::class, 'variant_id');
	}

	public function warehouse()
	{
		return $this->belongsTo(Warehouse::class);
	}
}
