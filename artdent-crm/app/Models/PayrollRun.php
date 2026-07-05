<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $company_id
 * @property int|null $branch_id
 * @property Carbon $period_from
 * @property Carbon $period_to
 * @property string $type
 * @property string $status
 * @property int|null $generated_by
 * @property int|null $approved_by
 * @property Carbon|null $approved_at
 * @property string|null $notes
 * @property Branch|null $branch
 * @property User|null $generatedBy
 * @property User|null $approvedBy
 * @property Collection|EmployeeReceipt[] $receipts
 */
class PayrollRun extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'branch_id' => 'int',
        'period_from' => 'date:Y-m-d',
        'period_to' => 'date:Y-m-d',
        'approved_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'branch_id',
        'period_from',
        'period_to',
        'type',
        'status',
        'generated_by',
        'approved_by',
        'approved_at',
        'notes',
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(EmployeeReceipt::class);
    }
}
