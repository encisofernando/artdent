<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property int|null $uploaded_by
 * @property string $type
 * @property string $file_path
 * @property Carbon|null $expires_at
 * @property string|null $notes
 * @property Employee $employee
 * @property User|null $uploadedBy
 */
class EmployeeDocument extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'uploaded_by' => 'int',
        'expires_at' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'uploaded_by',
        'type',
        'file_path',
        'expires_at',
        'notes',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
