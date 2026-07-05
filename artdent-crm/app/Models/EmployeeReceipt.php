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
 * @property int $employee_id
 * @property int|null $payroll_run_id
 * @property int|null $created_by
 * @property Carbon $period_from
 * @property Carbon $period_to
 * @property float $salary_gross
 * @property float $commission_gross
 * @property float $gross
 * @property float $extras_total
 * @property float $discounts_total
 * @property float $concepts_total
 * @property float $employer_contributions_total
 * @property float $net
 * @property float $sales_total
 * @property string $status
 * @property Carbon|null $paid_at
 * @property string|null $notes
 * @property array|null $formula_snapshot
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Employee $employee
 * @property User|null $creator
 * @property PayrollRun|null $payrollRun
 * @property Collection|EmployeeReceiptLine[] $lines
 */
class EmployeeReceipt extends Model
{
    protected $table = 'employee_receipts';

    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'payroll_run_id' => 'int',
        'created_by' => 'int',
        'period_from' => 'date:Y-m-d',
        'period_to' => 'date:Y-m-d',
        'salary_gross' => 'float',
        'commission_gross' => 'float',
        'gross' => 'float',
        'extras_total' => 'float',
        'discounts_total' => 'float',
        'concepts_total' => 'float',
        'employer_contributions_total' => 'float',
        'net' => 'float',
        'sales_total' => 'float',
        'paid_at' => 'datetime',
        'formula_snapshot' => 'array',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'payroll_run_id',
        'created_by',
        'period_from',
        'period_to',
        'salary_gross',
        'commission_gross',
        'gross',
        'extras_total',
        'discounts_total',
        'concepts_total',
        'employer_contributions_total',
        'net',
        'sales_total',
        'status',
        'paid_at',
        'notes',
        'formula_snapshot',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(EmployeeReceiptLine::class);
    }
}
