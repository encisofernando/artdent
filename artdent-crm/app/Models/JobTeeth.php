<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class JobTeeth
 * 
 * @property int $id
 * @property int $job_id
 * @property string $tooth
 * @property string|null $note
 * 
 * @property Job $job
 *
 * @package App\Models
 */
class JobTeeth extends Model
{
	protected $table = 'job_teeth';
	public $timestamps = false;

	protected $casts = [
		'job_id' => 'int'
	];

	protected $fillable = [
		'job_id',
		'tooth',
		'note'
	];

	public function job()
	{
		return $this->belongsTo(Job::class);
	}
}
