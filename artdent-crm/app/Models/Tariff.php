<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Tariff
 * 
 * @property int $id
 * @property int $company_id
 * @property string|null $code
 * @property string $name
 * @property string|null $category
 * @property float $price
 * @property string|null $unit
 * @property string|null $description
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Company $company
 * @property Collection|Dentist[] $dentists
 * @property Collection|JobItem[] $job_items
 *
 * @package App\Models
 */
class Tariff extends Model
{
	protected $table = 'tariffs';

	protected $casts = [
		'company_id' => 'int',
		'price' => 'float',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'company_id',
		'code',
		'name',
		'category',
		'price',
		'unit',
		'description',
		'is_active'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function costs()
	{
		return $this->hasMany(TariffCost::class);
	}

	public function dentists()
	{
		return $this->belongsToMany(Dentist::class, 'dentist_tariff_prices')
					->withPivot('id', 'price')
					->withTimestamps();
	}

	public function job_items()
	{
		return $this->hasMany(JobItem::class);
	}
}
