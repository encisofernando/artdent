<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class JobCollaborator
 * 
 * @property int $id
 * @property int $job_id
 * @property int $collaborator_id
 * @property int|null $assigned_by
 * @property string|null $role
 * @property Carbon|null $assigned_at
 * @property Carbon|null $completed_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User|null $user
 * @property Collaborator $collaborator
 * @property Job $job
 *
 * @package App\Models
 */
class JobCollaborator extends Model
{
	protected $table = 'job_collaborators';

	protected $casts = [
		'job_id' => 'int',
		'collaborator_id' => 'int',
		'assigned_by' => 'int',
		'assigned_at' => 'datetime',
		'completed_at' => 'datetime'
	];

	protected $fillable = [
		'job_id',
		'collaborator_id',
		'assigned_by',
		'role',
		'assigned_at',
		'completed_at',
		'notes'
	];

	public function user()
	{
		return $this->belongsTo(User::class, 'assigned_by');
	}

	public function collaborator()
	{
		return $this->belongsTo(Collaborator::class);
	}

	public function job()
	{
		return $this->belongsTo(Job::class);
	}
}
