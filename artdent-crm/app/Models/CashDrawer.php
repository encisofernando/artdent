<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CashDrawer
 * 
 * @property int $id
 * @property int $company_id
 * @property int|null $branch_id
 * @property string $name
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Branch|null $branch
 * @property Company $company
 * @property Collection|CashSession[] $cash_sessions
 *
 * @package App\Models
 */
class CashDrawer extends Model
{
	protected $table = 'cash_drawers';

	protected $casts = [
		'company_id' => 'int',
		'branch_id' => 'int',
		'is_active' => 'bool'
	];

	protected $fillable = [
		'company_id',
		'branch_id',
		'name',
		'is_active'
	];

	public function branch()
	{
		return $this->belongsTo(Branch::class);
	}

	public function company()
	{
		return $this->belongsTo(Company::class);
	}

	public function cash_sessions()
	{
		return $this->hasMany(CashSession::class);
	}
}
