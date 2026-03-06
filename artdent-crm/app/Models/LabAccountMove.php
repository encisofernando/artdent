<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class LabAccountMove
 * 
 * @property int $id
 * @property int $lab_account_id
 * @property int|null $user_id
 * @property string $type
 * @property float $amount
 * @property float|null $balance_after
 * @property string|null $description
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property int|null $payment_method_id
 * @property Carbon $move_date
 * @property Carbon|null $created_at
 * 
 * @property LabAccount $lab_account
 * @property PaymentMethod|null $payment_method
 * @property User|null $user
 *
 * @package App\Models
 */
class LabAccountMove extends Model
{
	protected $table = 'lab_account_moves';
	public $timestamps = false;

	protected $casts = [
		'lab_account_id' => 'int',
		'user_id' => 'int',
		'amount' => 'float',
		'balance_after' => 'float',
		'reference_id' => 'int',
		'payment_method_id' => 'int',
		'move_date' => 'datetime'
	];

	protected $fillable = [
		'lab_account_id',
		'user_id',
		'type',
		'amount',
		'balance_after',
		'description',
		'reference_type',
		'reference_id',
		'payment_method_id',
		'move_date'
	];

	public function lab_account()
	{
		return $this->belongsTo(LabAccount::class);
	}

	public function payment_method()
	{
		return $this->belongsTo(PaymentMethod::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
