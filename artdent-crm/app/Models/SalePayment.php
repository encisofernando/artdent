<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class SalePayment
 * 
 * @property int $id
 * @property int $sale_id
 * @property int|null $payment_method_id
 * @property float $amount
 * @property string|null $reference
 * @property Carbon|null $paid_at
 * @property Carbon|null $created_at
 * 
 * @property PaymentMethod|null $payment_method
 * @property Sale $sale
 *
 * @package App\Models
 */
class SalePayment extends Model
{
	protected $table = 'sale_payments';
	public $timestamps = false;

	protected $casts = [
		'sale_id' => 'int',
		'payment_method_id' => 'int',
		'amount' => 'float',
		'paid_at' => 'datetime'
	];

	protected $fillable = [
		'sale_id',
		'payment_method_id',
		'amount',
		'reference',
		'paid_at'
	];

	public function payment_method()
	{
		return $this->belongsTo(PaymentMethod::class);
	}

	public function sale()
	{
		return $this->belongsTo(Sale::class);
	}
}
