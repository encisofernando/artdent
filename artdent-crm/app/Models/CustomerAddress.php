<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CustomerAddress
 * 
 * @property int $id
 * @property int $customer_id
 * @property string|null $label
 * @property string|null $recipient
 * @property string $address
 * @property string|null $city
 * @property string|null $province
 * @property string|null $postal_code
 * @property string|null $phone
 * @property bool|null $is_default
 * @property Carbon|null $created_at
 * 
 * @property Customer $customer
 *
 * @package App\Models
 */
class CustomerAddress extends Model
{
	protected $table = 'customer_addresses';
	public $timestamps = false;

	protected $casts = [
		'customer_id' => 'int',
		'is_default' => 'bool'
	];

	protected $fillable = [
		'customer_id',
		'label',
		'recipient',
		'address',
		'city',
		'province',
		'postal_code',
		'phone',
		'is_default'
	];

	public function customer()
	{
		return $this->belongsTo(Customer::class);
	}
}
