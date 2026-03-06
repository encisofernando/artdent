<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ExpenseCategory
 * 
 * @property int $id
 * @property string $name
 * @property string|null $type
 * @property Carbon|null $created_at
 * 
 * @property Collection|Expense[] $expenses
 *
 * @package App\Models
 */
class ExpenseCategory extends Model
{
	protected $table = 'expense_categories';
	public $timestamps = false;

	protected $fillable = [
		'name',
		'type'
	];

	public function expenses()
	{
		return $this->hasMany(Expense::class);
	}
}
