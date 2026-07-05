<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property Carbon $work_date
 * @property string|null $time_in
 * @property string|null $time_out
 * @property float $hours
 * @property string $method
 * @property string|null $ip_address
 * @property string|null $device_info
 * @property bool $is_absent
 * @property string|null $absence_reason
 * @property string|null $notes
 * @property Employee $employee
 * @property Company $company
 */
class EmployeeAttendance extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'work_date' => 'date:Y-m-d',
        'hours' => 'float',
        'is_absent' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'work_date',
        'time_in',
        'time_out',
        'hours',
        'method',
        'ip_address',
        'device_info',
        'is_absent',
        'absence_reason',
        'notes',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
