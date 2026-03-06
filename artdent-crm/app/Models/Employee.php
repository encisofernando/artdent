<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Employee
 * 
 * @property int $id
 * @property int $user_id
 * @property int|null $branch_id
 * @property string|null $dni
 * @property string|null $position
 * @property float|null $salary
 * @property Carbon|null $hire_date
 * @property Carbon|null $end_date
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property Branch|null $branch
 * @property User $user
 *
 * @package App\Models
 */
class Employee extends Model
{
	use SoftDeletes;
	protected $table = 'employees';

	protected $casts = [
		'user_id' => 'int',
		'branch_id' => 'int',
		'salary' => 'float',
		'hire_date' => 'datetime',
		'end_date' => 'datetime'
	];

	protected $fillable = [
		'user_id',
		'branch_id',
		'dni',
		'position',
		'salary',
		'hire_date',
		'end_date',
		'notes'
	];

	public function branch()
	{
		return $this->belongsTo(Branch::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
