<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class PaymentMethod
 * 
 * @property int $id
 * @property string $name
 * @property string|null $type
 * @property float|null $surcharge_pct
 * @property bool|null $is_active
 * @property string|null $applies_to
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Collection|CashMovement[] $cash_movements
 * @property Collection|CollaboratorReceipt[] $collaborator_receipts
 * @property Collection|Expense[] $expenses
 * @property Collection|LabAccountMove[] $lab_account_moves
 * @property Collection|SalePayment[] $sale_payments
 *
 * @package App\Models
 */
class PaymentMethod extends Model
{
	protected $table = 'payment_methods';

	protected $casts = [
		'surcharge_pct' => 'float',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'name',
		'type',
		'surcharge_pct',
		'is_active',
		'applies_to'
	];

	public function cash_movements()
	{
		return $this->hasMany(CashMovement::class);
	}

	public function collaborator_receipts()
	{
		return $this->hasMany(CollaboratorReceipt::class);
	}

	public function expenses()
	{
		return $this->hasMany(Expense::class);
	}

	public function lab_account_moves()
	{
		return $this->hasMany(LabAccountMove::class);
	}

	public function sale_payments()
	{
		return $this->hasMany(SalePayment::class);
	}
}
