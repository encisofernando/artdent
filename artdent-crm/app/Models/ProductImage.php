<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ProductImage
 * 
 * @property int $id
 * @property int $product_id
 * @property int|null $variant_id
 * @property string $url
 * @property string|null $alt
 * @property int|null $sort_order
 * @property bool|null $is_cover
 * @property Carbon|null $created_at
 * 
 * @property Product $product
 *
 * @package App\Models
 */
class ProductImage extends Model
{
	protected $table = 'product_images';
	public $timestamps = false;

	protected $casts = [
		'product_id' => 'int',
		'variant_id' => 'int',
		'sort_order' => 'int',
		'is_cover' => 'bool'
	];

	protected $fillable = [
		'product_id',
		'variant_id',
		'url',
		'alt',
		'sort_order',
		'is_cover'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}
}
