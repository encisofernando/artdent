<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $evaluation_id
 * @property int $evaluation_criterion_id
 * @property float $score
 * @property string|null $comment
 * @property Evaluation $evaluation
 * @property EvaluationCriterion $criterion
 */
class EvaluationScore extends Model
{
    protected $casts = [
        'evaluation_id' => 'int',
        'evaluation_criterion_id' => 'int',
        'score' => 'float',
    ];

    protected $fillable = [
        'evaluation_id',
        'evaluation_criterion_id',
        'score',
        'comment',
    ];

    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(Evaluation::class);
    }

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(EvaluationCriterion::class, 'evaluation_criterion_id');
    }
}
