<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property int|null $created_by
 * @property Carbon $period_from
 * @property Carbon $period_to
 * @property float $salary_gross
 * @property float $commission_gross
 * @property float $gross
 * @property float $extras_total
 * @property float $discounts_total
 * @property float $net
 * @property float $sales_total
 * @property string $status
 * @property Carbon|null $paid_at
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Employee $employee
 * @property User|null $creator
 */
class EmployeeReceipt extends Model
{
    protected $table = 'employee_receipts';

    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'created_by' => 'int',
        'period_from' => 'date:Y-m-d',
        'period_to' => 'date:Y-m-d',
        'salary_gross' => 'float',
        'commission_gross' => 'float',
        'gross' => 'float',
        'extras_total' => 'float',
        'discounts_total' => 'float',
        'net' => 'float',
        'sales_total' => 'float',
        'paid_at' => 'datetime',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'created_by',
        'period_from',
        'period_to',
        'salary_gross',
        'commission_gross',
        'gross',
        'extras_total',
        'discounts_total',
        'net',
        'sales_total',
        'status',
        'paid_at',
        'notes',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
