<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property int $leave_type_id
 * @property int $year
 * @property float $accrued_days
 * @property float $used_days
 * @property Employee $employee
 * @property LeaveType $leaveType
 */
class LeaveBalance extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'leave_type_id' => 'int',
        'year' => 'int',
        'accrued_days' => 'float',
        'used_days' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'leave_type_id',
        'year',
        'accrued_days',
        'used_days',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function remainingDays(): float
    {
        return round($this->accrued_days - $this->used_days, 2);
    }
}
