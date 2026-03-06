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
 * Class Patient
 * 
 * @property int $id
 * @property int $dentist_id
 * @property string $name
 * @property Carbon|null $birth_date
 * @property string|null $gender
 * @property string|null $phone
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property Dentist $dentist
 * @property Collection|Job[] $jobs
 *
 * @package App\Models
 */
class Patient extends Model
{
	use SoftDeletes;
	protected $table = 'patients';

	protected $casts = [
		'dentist_id' => 'int',
		'birth_date' => 'datetime'
	];

	protected $fillable = [
		'dentist_id',
		'name',
		'birth_date',
		'gender',
		'phone',
		'notes'
	];

	public function dentist()
	{
		return $this->belongsTo(Dentist::class);
	}

	public function jobs()
	{
		return $this->hasMany(Job::class);
	}
}
