<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property Carbon $occurred_at
 * @property string $description
 * @property string|null $art_case_number
 * @property string $status
 * @property int $days_lost
 * @property string|null $file_path
 * @property Employee $employee
 */
class ArtAccident extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'occurred_at' => 'datetime',
        'days_lost' => 'int',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'occurred_at',
        'description',
        'art_case_number',
        'status',
        'days_lost',
        'file_path',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
