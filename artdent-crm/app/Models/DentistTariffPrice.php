<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class DentistTariffPrice
 * 
 * @property int $id
 * @property int $dentist_id
 * @property int $tariff_id
 * @property float $price
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Dentist $dentist
 * @property Tariff $tariff
 *
 * @package App\Models
 */
class DentistTariffPrice extends Model
{
	protected $table = 'dentist_tariff_prices';

	protected $casts = [
		'dentist_id' => 'int',
		'tariff_id' => 'int',
		'price' => 'float'
	];

	protected $fillable = [
		'dentist_id',
		'tariff_id',
		'price'
	];

	public function dentist()
	{
		return $this->belongsTo(Dentist::class);
	}

	public function tariff()
	{
		return $this->belongsTo(Tariff::class);
	}
}
