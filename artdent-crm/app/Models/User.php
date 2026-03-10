<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

/**
 * Class User
 * 
 * @property int $id
 * @property int $company_id
 * @property int|null $branch_id
 * @property string $name
 * @property string $email
 * @property string $password
 * @property string|null $phone
 * @property string|null $avatar_url
 * @property bool|null $is_active
 * @property Carbon|null $email_verified_at
 * @property string|null $remember_token
 * @property Carbon|null $last_login_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property Company $company
 * @property Collection|CashSession[] $cash_sessions
 * @property Collection|CollaboratorReceipt[] $collaborator_receipts
 * @property Employee|null $employee
 * @property Collection|JobCollaborator[] $job_collaborators
 * @property Collection|Job[] $jobs
 * @property Collection|LabAccountMove[] $lab_account_moves
 * @property Collection|Role[] $roles
 *
 * @package App\Models
 */
class User extends Authenticatable
{
	use SoftDeletes, Notifiable, HasApiTokens;
	protected $table = 'users';

	protected $casts = [
		'company_id' => 'int',
		'branch_id' => 'int',
		'is_active' => 'bool',
		'email_verified_at' => 'datetime',
		'last_login_at' => 'datetime'
	];

	protected $hidden = [
		'password',
		'remember_token'
	];

	protected $fillable = [
		'company_id',
		'branch_id',
		'name',
		'email',
		'password',
		'phone',
		'avatar_url',
		'is_active',
		'email_verified_at',
		'remember_token',
		'last_login_at'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function cash_sessions()
	{
		return $this->hasMany(CashSession::class);
	}

	public function collaborator_receipts()
	{
		return $this->hasMany(CollaboratorReceipt::class, 'created_by');
	}

	public function employee()
	{
		return $this->hasOne(Employee::class);
	}

	public function job_collaborators()
	{
		return $this->hasMany(JobCollaborator::class, 'assigned_by');
	}

	public function jobs()
	{
		return $this->hasMany(Job::class, 'assigned_user_id');
	}

	public function lab_account_moves()
	{
		return $this->hasMany(LabAccountMove::class);
	}

	public function roles()
	{
		return $this->belongsToMany(Role::class);
	}
}
