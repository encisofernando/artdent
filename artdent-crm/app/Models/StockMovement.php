<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class StockMovement
 * 
 * @property int $id
 * @property int $product_id
 * @property int|null $variant_id
 * @property int $warehouse_id
 * @property int|null $user_id
 * @property string $type
 * @property float $quantity
 * @property float|null $stock_before
 * @property float|null $stock_after
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property string|null $note
 * @property Carbon|null $created_at
 * 
 * @property Product $product
 * @property Warehouse $warehouse
 *
 * @package App\Models
 */
class StockMovement extends Model
{
	protected $table = 'stock_movements';
	public $timestamps = false;

	protected $casts = [
		'product_id' => 'int',
		'variant_id' => 'int',
		'warehouse_id' => 'int',
		'user_id' => 'int',
		'quantity' => 'float',
		'stock_before' => 'float',
		'stock_after' => 'float',
		'reference_id' => 'int'
	];

	protected $fillable = [
		'product_id',
		'variant_id',
		'warehouse_id',
		'user_id',
		'type',
		'quantity',
		'stock_before',
		'stock_after',
		'reference_type',
		'reference_id',
		'note'
	];

	public function product()
	{
		return $this->belongsTo(Product::class);
	}

	public function warehouse()
	{
		return $this->belongsTo(Warehouse::class);
	}
}
