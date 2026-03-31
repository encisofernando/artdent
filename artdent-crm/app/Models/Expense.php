<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Expense
 * 
 * @property int $id
 * @property int $company_id
 * @property string|null $scope
 * @property int|null $branch_id
 * @property int|null $expense_category_id
 * @property int|null $user_id
 * @property int|null $payment_method_id
 * @property string $description
 * @property float $amount
 * @property float|null $tax_amount
 * @property int|null $vendor_id
 * @property string|null $reference
 * @property Carbon $expense_date
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property ExpenseCategory|null $expense_category
 * @property Company $company
 * @property PaymentMethod|null $payment_method
 * @property Vendor|null $vendor
 *
 * @package App\Models
 */
class Expense extends Model
{
	protected $table = 'expenses';

	protected $casts = [
		'company_id' => 'int',
		'branch_id' => 'int',
		'expense_category_id' => 'int',
		'user_id' => 'int',
		'payment_method_id' => 'int',
		'amount' => 'float',
		'tax_amount' => 'float',
		'vendor_id' => 'int',
		'expense_date' => 'datetime'
	];

	protected $fillable = [
		'company_id',
		'scope',
		'branch_id',
		'expense_category_id',
		'user_id',
		'payment_method_id',
		'description',
		'amount',
		'tax_amount',
		'vendor_id',
		'reference',
		'expense_date',
		'notes'
	];

	public function expense_category()
	{
		return $this->belongsTo(ExpenseCategory::class);
	}

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function payment_method()
	{
		return $this->belongsTo(PaymentMethod::class);
	}

	public function vendor()
	{
		return $this->belongsTo(Vendor::class);
	}
}
