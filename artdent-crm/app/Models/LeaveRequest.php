<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property int $leave_type_id
 * @property Carbon $start_date
 * @property Carbon $end_date
 * @property float $days_count
 * @property string $status
 * @property int|null $requested_by
 * @property int|null $approved_by
 * @property Carbon|null $approved_at
 * @property string|null $attachment_path
 * @property string|null $notes
 * @property Employee $employee
 * @property LeaveType $leaveType
 * @property User|null $requestedBy
 * @property User|null $approvedBy
 */
class LeaveRequest extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'leave_type_id' => 'int',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'days_count' => 'float',
        'requested_by' => 'int',
        'approved_by' => 'int',
        'approved_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'days_count',
        'status',
        'requested_by',
        'approved_by',
        'approved_at',
        'attachment_path',
        'notes',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
