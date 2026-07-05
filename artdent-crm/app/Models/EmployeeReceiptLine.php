<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $employee_receipt_id
 * @property int|null $payroll_concept_id
 * @property string $label
 * @property string $type
 * @property float $amount
 * @property float|null $base_amount
 * @property float|null $rate
 * @property string|null $formula_snapshot
 * @property int $order
 * @property EmployeeReceipt $receipt
 * @property PayrollConcept|null $concept
 */
class EmployeeReceiptLine extends Model
{
    protected $casts = [
        'employee_receipt_id' => 'int',
        'payroll_concept_id' => 'int',
        'amount' => 'float',
        'base_amount' => 'float',
        'rate' => 'float',
        'order' => 'int',
    ];

    protected $fillable = [
        'employee_receipt_id',
        'payroll_concept_id',
        'label',
        'type',
        'amount',
        'base_amount',
        'rate',
        'formula_snapshot',
        'order',
    ];

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(EmployeeReceipt::class, 'employee_receipt_id');
    }

    public function concept(): BelongsTo
    {
        return $this->belongsTo(PayrollConcept::class, 'payroll_concept_id');
    }
}
