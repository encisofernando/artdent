<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Dentist
 * 
 * @property int $id
 * @property int $company_id
 * @property string|null $code
 * @property string|null $type
 * @property string $name
 * @property string|null $contact_name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $phone_alt
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property string|null $cuit
 * @property string|null $iva_condition
 * @property string|null $license_number
 * @property float|null $credit_limit
 * @property int|null $payment_days
 * @property bool|null $is_active
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property Company $company
 * @property Collection|Tariff[] $tariffs
 * @property Collection|Job[] $jobs
 * @property LabAccount|null $lab_account
 * @property Collection|Patient[] $patients
 *
 * @package App\Models
 */
class Dentist extends Model
{
	use SoftDeletes;
	protected $table = 'dentists';

	protected $casts = [
		'company_id' => 'int',
		'credit_limit' => 'float',
		'payment_days' => 'int',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'company_id',
		'code',
		'type',
		'name',
		'contact_name',
		'email',
		'phone',
		'phone_alt',
		'address',
		'city',
		'province',
		'cuit',
		'iva_condition',
		'license_number',
		'credit_limit',
		'payment_days',
		'is_active',
		'notes'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function tariffs()
	{
		return $this->belongsToMany(Tariff::class, 'dentist_tariff_prices')
					->withPivot('id', 'price')
					->withTimestamps();
	}

	public function jobs()
	{
		return $this->hasMany(Job::class);
	}

	public function lab_account()
	{
		return $this->hasOne(LabAccount::class);
	}

	public function patients()
	{
		return $this->hasMany(Patient::class);
	}
}
