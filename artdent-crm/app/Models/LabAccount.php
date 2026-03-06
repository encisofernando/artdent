<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class LabAccount
 * 
 * @property int $id
 * @property int $dentist_id
 * @property float $balance
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Dentist $dentist
 * @property Collection|LabAccountMove[] $lab_account_moves
 *
 * @package App\Models
 */
class LabAccount extends Model
{
	protected $table = 'lab_accounts';

	protected $casts = [
		'dentist_id' => 'int',
		'balance' => 'float'
	];

	protected $fillable = [
		'dentist_id',
		'balance'
	];

	public function dentist()
	{
		return $this->belongsTo(Dentist::class);
	}

	public function lab_account_moves()
	{
		return $this->hasMany(LabAccountMove::class);
	}
}
