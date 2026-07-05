<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $evaluation_cycle_id
 * @property string $name
 * @property float $weight
 * @property EvaluationCycle $evaluationCycle
 */
class EvaluationCriterion extends Model
{
    protected $casts = [
        'evaluation_cycle_id' => 'int',
        'weight' => 'float',
    ];

    protected $fillable = [
        'evaluation_cycle_id',
        'name',
        'weight',
    ];

    public function evaluationCycle(): BelongsTo
    {
        return $this->belongsTo(EvaluationCycle::class);
    }
}
