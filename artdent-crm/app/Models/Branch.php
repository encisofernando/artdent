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
 * Class Branch
 * 
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $code
 * @property string|null $address
 * @property string|null $phone
 * @property string|null $email
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * 
 * @property Company $company
 * @property Collection|CashDrawer[] $cash_drawers
 * @property Collection|Employee[] $employees
 * @property Collection|Sale[] $sales
 *
 * @package App\Models
 */
class Branch extends Model
{
	use SoftDeletes;
	protected $table = 'branches';

	protected $casts = [
		'company_id' => 'int',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'company_id',
		'name',
		'code',
		'address',
		'phone',
		'email',
		'is_active'
	];

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function cash_drawers()
	{
		return $this->hasMany(CashDrawer::class);
	}

	public function employees()
	{
		return $this->hasMany(Employee::class);
	}

	public function sales()
	{
		return $this->hasMany(Sale::class);
	}
}
