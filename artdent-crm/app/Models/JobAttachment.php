<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class JobAttachment
 * 
 * @property int $id
 * @property int $job_id
 * @property int|null $user_id
 * @property string $filename
 * @property string $url
 * @property string|null $mime_type
 * @property int|null $size_bytes
 * @property string|null $note
 * @property Carbon|null $created_at
 * 
 * @property Job $job
 *
 * @package App\Models
 */
class JobAttachment extends Model
{
	protected $table = 'job_attachments';
	public $timestamps = false;

	protected $casts = [
		'job_id' => 'int',
		'user_id' => 'int',
		'size_bytes' => 'int'
	];

	protected $fillable = [
		'job_id',
		'user_id',
		'filename',
		'url',
		'mime_type',
		'size_bytes',
		'note'
	];

	public function job()
	{
		return $this->belongsTo(Job::class);
	}
}
