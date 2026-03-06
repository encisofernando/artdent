<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class CrmClient
 * 
 * @property int $id
 * @property int|null $customer_id
 * @property int $company_id
 * @property string $name
 * @property string|null $email
 * @property string|null $phone
 * @property string|null $dni
 * @property string|null $address
 * @property string|null $city
 * @property string|null $province
 * @property Carbon|null $birth_date
 * @property string|null $notes
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property Company $company
 * @property Customer|null $customer
 *
 * @package App\Models
 */
class CrmClient extends Model
{
	use SoftDeletes;
	protected $table = 'crm_clients';

	protected $casts = [
		'customer_id' => 'int',
		'company_id' => 'int',
		'birth_date' => 'datetime',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'customer_id',
		'company_id',
		'name',
		'email',
		'phone',
		'dni',
		'address',
		'city',
		'province',
		'birth_date',
		'notes',
		'is_active'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function customer()
	{
		return $this->belongsTo(Customer::class);
	}
}
