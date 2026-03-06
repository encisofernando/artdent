<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Tax
 * 
 * @property int $id
 * @property string $name
 * @property float $rate
 * @property string|null $afip_code
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Product[] $products
 *
 * @package App\Models
 */
class Tax extends Model
{
	protected $table = 'taxes';

	protected $casts = [
		'rate' => 'float',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'name',
		'rate',
		'afip_code',
		'is_active'
	];

	public function products()
	{
		return $this->hasMany(Product::class);
	}
}
