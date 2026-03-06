<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CollaboratorAttendance
 * 
 * @property int $id
 * @property int $company_id
 * @property int $collaborator_id
 * @property Carbon $work_date
 * @property Carbon|null $time_in
 * @property Carbon|null $time_out
 * @property float|null $hours
 * @property float|null $hourly_rate_snap
 * @property float|null $amount
 * @property string|null $method
 * @property string|null $ip_address
 * @property string|null $device_info
 * @property bool|null $is_absent
 * @property string|null $absence_reason
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collaborator $collaborator
 * @property Company $company
 *
 * @package App\Models
 */
class CollaboratorAttendance extends Model
{
	protected $table = 'collaborator_attendances';

	protected $casts = [
		'company_id' => 'int',
		'collaborator_id' => 'int',
		'work_date' => 'datetime',
		'time_in' => 'datetime',
		'time_out' => 'datetime',
		'hours' => 'float',
		'hourly_rate_snap' => 'float',
		'amount' => 'float',
		'is_absent' => 'bool'
	];

	protected $fillable = [
		'company_id',
		'collaborator_id',
		'work_date',
		'time_in',
		'time_out',
		'hours',
		'hourly_rate_snap',
		'amount',
		'method',
		'ip_address',
		'device_info',
		'is_absent',
		'absence_reason',
		'notes'
	];

	public function collaborator()
	{
		return $this->belongsTo(Collaborator::class);
	}

	public function company()
	{
		return $this->belongsTo(Company::class);
	}
}
