<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $company_id
 * @property int $evaluation_cycle_id
 * @property int $employee_id
 * @property int|null $evaluator_id
 * @property string $status
 * @property string|null $summary
 * @property EvaluationCycle $evaluationCycle
 * @property Employee $employee
 * @property Employee|null $evaluator
 * @property Collection|EvaluationScore[] $scores
 */
class Evaluation extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'evaluation_cycle_id' => 'int',
        'employee_id' => 'int',
        'evaluator_id' => 'int',
    ];

    protected $fillable = [
        'company_id',
        'evaluation_cycle_id',
        'employee_id',
        'evaluator_id',
        'status',
        'summary',
    ];

    public function evaluationCycle(): BelongsTo
    {
        return $this->belongsTo(EvaluationCycle::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function evaluator(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'evaluator_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(EvaluationScore::class);
    }

    /**
     * Puntaje ponderado 0-10 según el peso de cada criterio en el ciclo. Null si todavía no
     * tiene ningún puntaje cargado.
     */
    public function weightedScore(): ?float
    {
        $scores = $this->scores()->with('criterion')->get();

        if ($scores->isEmpty()) {
            return null;
        }

        $totalWeight = $scores->sum(fn (EvaluationScore $s) => (float) ($s->criterion->weight ?? 0));

        if ($totalWeight <= 0) {
            return round($scores->avg('score'), 2);
        }

        $weighted = $scores->sum(fn (EvaluationScore $s) => $s->score * (float) ($s->criterion->weight ?? 0));

        return round($weighted / $totalWeight, 2);
    }
}
