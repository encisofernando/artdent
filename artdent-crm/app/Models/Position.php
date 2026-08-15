<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $company_id
 * @property int|null $department_id
 * @property int|null $reports_to_position_id
 * @property string $name
 * @property bool $is_active
 * @property Department|null $department
 * @property Position|null $reportsTo
 * @property Collection|Position[] $subordinatePositions
 * @property Collection|Employee[] $employees
 */
class Position extends Model
{
    use BelongsToCompany;
    use SoftDeletes;

    protected $casts = [
        'company_id' => 'int',
        'department_id' => 'int',
        'reports_to_position_id' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'department_id',
        'reports_to_position_id',
        'name',
        'is_active',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function reportsTo(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'reports_to_position_id');
    }

    public function subordinatePositions(): HasMany
    {
        return $this->hasMany(Position::class, 'reports_to_position_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
