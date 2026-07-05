<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $payroll_concept_id
 * @property int|null $created_by
 * @property string $formula
 * @property Carbon $effective_from
 * @property Carbon|null $effective_to
 * @property string|null $notes
 * @property PayrollConcept $concept
 * @property User|null $createdBy
 */
class PayrollConceptVersion extends Model
{
    protected $casts = [
        'payroll_concept_id' => 'int',
        'created_by' => 'int',
        'effective_from' => 'date:Y-m-d',
        'effective_to' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'payroll_concept_id',
        'created_by',
        'formula',
        'effective_from',
        'effective_to',
        'notes',
    ];

    public function concept(): BelongsTo
    {
        return $this->belongsTo(PayrollConcept::class, 'payroll_concept_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
