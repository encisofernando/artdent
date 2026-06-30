<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $company_id
 * @property int $user_id
 * @property int|null $branch_id
 * @property string|null $dni
 * @property string|null $position
 * @property float|null $salary
 * @property float $commission_pct
 * @property Carbon|null $hire_date
 * @property Carbon|null $end_date
 * @property bool $is_active
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property User $user
 * @property Branch|null $branch
 * @property Collection|EmployeeExtra[] $extras
 * @property Collection|EmployeeDiscount[] $discounts
 * @property Collection|EmployeeReceipt[] $receipts
 */
class Employee extends Model
{
    use SoftDeletes;

    protected $table = 'employees';

    protected $casts = [
        'company_id' => 'int',
        'user_id' => 'int',
        'branch_id' => 'int',
        'salary' => 'float',
        'commission_pct' => 'float',
        'hire_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'user_id',
        'branch_id',
        'dni',
        'position',
        'salary',
        'commission_pct',
        'hire_date',
        'end_date',
        'is_active',
        'notes',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(EmployeeExtra::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(EmployeeDiscount::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(EmployeeReceipt::class);
    }
}
