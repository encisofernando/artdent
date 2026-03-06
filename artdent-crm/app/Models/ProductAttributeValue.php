<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ProductAttributeValue
 * 
 * @property int $id
 * @property int $attribute_id
 * @property string $value
 * 
 * @property ProductAttribute $product_attribute
 * @property Collection|VariantAttributeValue[] $variant_attribute_values
 *
 * @package App\Models
 */
class ProductAttributeValue extends Model
{
	protected $table = 'product_attribute_values';
	public $timestamps = false;

	protected $casts = [
		'attribute_id' => 'int'
	];

	protected $fillable = [
		'attribute_id',
		'value'
	];

	public function product_attribute()
	{
		return $this->belongsTo(ProductAttribute::class, 'attribute_id');
	}

	public function variant_attribute_values()
	{
		return $this->hasMany(VariantAttributeValue::class, 'attribute_value_id');
	}
}
