<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CashMovement
 * 
 * @property int $id
 * @property int $cash_session_id
 * @property int|null $payment_method_id
 * @property string $type
 * @property float $amount
 * @property string|null $concept
 * @property string|null $reference_type
 * @property int|null $reference_id
 * @property Carbon|null $created_at
 * 
 * @property PaymentMethod|null $payment_method
 * @property CashSession $cash_session
 *
 * @package App\Models
 */
class CashMovement extends Model
{
	protected $table = 'cash_movements';
	public $timestamps = false;

	protected $casts = [
		'cash_session_id' => 'int',
		'payment_method_id' => 'int',
		'amount' => 'float',
		'reference_id' => 'int'
	];

	protected $fillable = [
		'cash_session_id',
		'payment_method_id',
		'type',
		'amount',
		'concept',
		'reference_type',
		'reference_id'
	];

	public function payment_method()
	{
		return $this->belongsTo(PaymentMethod::class);
	}

	public function cash_session()
	{
		return $this->belongsTo(CashSession::class);
	}
}
