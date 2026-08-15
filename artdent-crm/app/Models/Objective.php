<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property string $title
 * @property string|null $target
 * @property int $progress
 * @property Carbon|null $due_date
 * @property string $status
 * @property Employee $employee
 */
class Objective extends Model
{
    use BelongsToCompany;

    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'progress' => 'int',
        'due_date' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'title',
        'target',
        'progress',
        'due_date',
        'status',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
