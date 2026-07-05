<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $labor_agreement_category_id
 * @property int|null $created_by
 * @property float $base_amount
 * @property Carbon $effective_from
 * @property Carbon|null $effective_to
 * @property string|null $notes
 * @property LaborAgreementCategory $category
 * @property User|null $createdBy
 */
class SalaryScale extends Model
{
    protected $casts = [
        'labor_agreement_category_id' => 'int',
        'created_by' => 'int',
        'base_amount' => 'float',
        'effective_from' => 'date:Y-m-d',
        'effective_to' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'labor_agreement_category_id',
        'created_by',
        'base_amount',
        'effective_from',
        'effective_to',
        'notes',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(LaborAgreementCategory::class, 'labor_agreement_category_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
