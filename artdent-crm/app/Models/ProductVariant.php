<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ProductVariant
 * 
 * @property int $id
 * @property int $product_id
 * @property string|null $sku
 * @property string|null $barcode
 * @property float|null $price
 * @property float|null $cost_price
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Product $product
 * @property Collection|Stock[] $stocks
 * @property Collection|VariantAttributeValue[] $variant_attribute_values
 *
 * @package App\Models
 */
class ProductVariant extends Model
{
	protected $table = 'product_variants';

	protected $casts = [
		'product_id' => 'int',
		'price' => 'float',
		'cost_price' => 'float',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'product_id',
		'sku',
		'barcode',
		'price',
		'cost_price',
		'is_active'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}

	public function stocks()
	{
		return $this->hasMany(Stock::class, 'variant_id');
	}

	public function variant_attribute_values()
	{
		return $this->hasMany(VariantAttributeValue::class, 'variant_id');
	}
}
