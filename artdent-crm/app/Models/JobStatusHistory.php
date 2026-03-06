<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class JobStatusHistory
 * 
 * @property int $id
 * @property int $job_id
 * @property int|null $user_id
 * @property string $status
 * @property string|null $note
 * @property Carbon|null $created_at
 * 
 * @property Job $job
 *
 * @package App\Models
 */
class JobStatusHistory extends Model
{
	protected $table = 'job_status_history';
	public $timestamps = false;

	protected $casts = [
		'job_id' => 'int',
		'user_id' => 'int'
	];

	protected $fillable = [
		'job_id',
		'user_id',
		'status',
		'note'
	];

	public function job()
	{
		return $this->belongsTo(Job::class);
	}
}
