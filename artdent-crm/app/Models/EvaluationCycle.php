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
 * @property string $name
 * @property string $type
 * @property Carbon $period_start
 * @property Carbon $period_end
 * @property string $status
 * @property Company $company
 * @property Collection|EvaluationCriterion[] $criteria
 * @property Collection|Evaluation[] $evaluations
 */
class EvaluationCycle extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'period_start' => 'date:Y-m-d',
        'period_end' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'company_id',
        'name',
        'type',
        'period_start',
        'period_end',
        'status',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function criteria(): HasMany
    {
        return $this->hasMany(EvaluationCriterion::class);
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(Evaluation::class);
    }
}
