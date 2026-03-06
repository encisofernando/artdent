<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ShippingMethod
 * 
 * @property int $id
 * @property string $name
 * @property string|null $type
 * @property float|null $base_cost
 * @property float|null $free_above
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|Shipment[] $shipments
 *
 * @package App\Models
 */
class ShippingMethod extends Model
{
	protected $table = 'shipping_methods';

	protected $casts = [
		'base_cost' => 'float',
		'free_above' => 'float',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'name',
		'type',
		'base_cost',
		'free_above',
		'is_active'
	];

	public function shipments()
	{
		return $this->hasMany(Shipment::class);
	}
}
