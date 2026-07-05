<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property string $type
 * @property Carbon $exam_date
 * @property string|null $result
 * @property string|null $restrictions
 * @property string|null $file_path
 * @property Carbon|null $expires_at
 * @property Employee $employee
 */
class MedicalExam extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'exam_date' => 'date:Y-m-d',
        'expires_at' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'type',
        'exam_date',
        'result',
        'restrictions',
        'file_path',
        'expires_at',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function isExpiringSoon(int $withinDays = 30): bool
    {
        return $this->expires_at !== null
            && $this->expires_at->isFuture()
            && now()->diffInDays($this->expires_at, false) <= $withinDays;
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
