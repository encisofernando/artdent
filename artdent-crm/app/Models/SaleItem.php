<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class SaleItem
 * 
 * @property int $id
 * @property int $sale_id
 * @property int|null $product_id
 * @property int|null $variant_id
 * @property string $product_name
 * @property string|null $sku
 * @property float $quantity
 * @property float $unit_price
 * @property float|null $discount
 * @property float|null $tax_amount
 * @property float $total
 * 
 * @property Product|null $product
 * @property Sale $sale
 *
 * @package App\Models
 */
class SaleItem extends Model
{
	protected $table = 'sale_items';
	public $timestamps = false;

	protected $casts = [
		'sale_id' => 'int',
		'product_id' => 'int',
		'variant_id' => 'int',
		'quantity' => 'float',
		'unit_price' => 'float',
		'discount' => 'float',
		'tax_amount' => 'float',
		'total' => 'float'
	];

	protected $fillable = [
		'sale_id',
		'product_id',
		'variant_id',
		'product_name',
		'sku',
		'quantity',
		'unit_price',
		'discount',
		'tax_amount',
		'total'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}

	public function sale()
	{
		return $this->belongsTo(Sale::class);
	}
}
