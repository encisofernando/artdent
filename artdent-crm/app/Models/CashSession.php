<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class CashSession
 * 
 * @property int $id
 * @property int $cash_drawer_id
 * @property int $user_id
 * @property Carbon $opened_at
 * @property Carbon|null $closed_at
 * @property float|null $opening_amount
 * @property float|null $closing_amount
 * @property string|null $status
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property CashDrawer $cash_drawer
 * @property User $user
 * @property Collection|CashMovement[] $cash_movements
 * @property Collection|Sale[] $sales
 *
 * @package App\Models
 */
class CashSession extends Model
{
	protected $table = 'cash_sessions';

	protected $casts = [
		'cash_drawer_id' => 'int',
		'user_id' => 'int',
		'opened_at' => 'datetime',
		'closed_at' => 'datetime',
		'opening_amount' => 'float',
		'closing_amount' => 'float'
	];

	protected $fillable = [
		'cash_drawer_id',
		'user_id',
		'opened_at',
		'closed_at',
		'opening_amount',
		'closing_amount',
		'status',
		'notes'
	];

	public function cash_drawer()
	{
		return $this->belongsTo(CashDrawer::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function cash_movements()
	{
		return $this->hasMany(CashMovement::class);
	}

	public function sales()
	{
		return $this->hasMany(Sale::class);
	}
}
