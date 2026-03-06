<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class JobItem
 * 
 * @property int $id
 * @property int $job_id
 * @property int|null $tariff_id
 * @property string $description
 * @property float $quantity
 * @property float $unit_price
 * @property float|null $discount
 * @property float $total
 * 
 * @property Job $job
 * @property Tariff|null $tariff
 *
 * @package App\Models
 */
class JobItem extends Model
{
	protected $table = 'job_items';
	public $timestamps = false;

	protected $casts = [
		'job_id' => 'int',
		'tariff_id' => 'int',
		'quantity' => 'float',
		'unit_price' => 'float',
		'discount' => 'float',
		'total' => 'float'
	];

	protected $fillable = [
		'job_id',
		'tariff_id',
		'description',
		'quantity',
		'unit_price',
		'discount',
		'total'
	];

	public function job()
	{
		return $this->belongsTo(Job::class);
	}

	public function tariff()
	{
		return $this->belongsTo(Tariff::class);
	}
}
