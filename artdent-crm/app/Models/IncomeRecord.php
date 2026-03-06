<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class IncomeRecord
 * 
 * @property int $id
 * @property int $company_id
 * @property int|null $expense_category_id
 * @property int|null $user_id
 * @property int|null $payment_method_id
 * @property string $description
 * @property float $amount
 * @property Carbon $income_date
 * @property string|null $notes
 * @property Carbon|null $created_at
 * 
 * @property Company $company
 *
 * @package App\Models
 */
class IncomeRecord extends Model
{
	protected $table = 'income_records';
	public $timestamps = false;

	protected $casts = [
		'company_id' => 'int',
		'expense_category_id' => 'int',
		'user_id' => 'int',
		'payment_method_id' => 'int',
		'amount' => 'float',
		'income_date' => 'datetime'
	];

	protected $fillable = [
		'company_id',
		'expense_category_id',
		'user_id',
		'payment_method_id',
		'description',
		'amount',
		'income_date',
		'notes'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}
}
