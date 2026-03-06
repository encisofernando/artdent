<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ProductAttribute
 * 
 * @property int $id
 * @property string $name
 * @property Carbon|null $created_at
 * 
 * @property Collection|ProductAttributeValue[] $product_attribute_values
 *
 * @package App\Models
 */
class ProductAttribute extends Model
{
	protected $table = 'product_attributes';
	public $timestamps = false;

	protected $fillable = [
		'name'
	];

	public function product_attribute_values()
	{
		return $this->hasMany(ProductAttributeValue::class, 'attribute_id');
	}
}
