<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $training_id
 * @property Carbon $start_date
 * @property Carbon|null $end_date
 * @property string|null $location
 * @property int|null $capacity
 * @property Training $training
 * @property Collection|TrainingEnrollment[] $enrollments
 */
class TrainingSession extends Model
{
    protected $casts = [
        'training_id' => 'int',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'capacity' => 'int',
    ];

    protected $fillable = [
        'training_id',
        'start_date',
        'end_date',
        'location',
        'capacity',
    ];

    public function training(): BelongsTo
    {
        return $this->belongsTo(Training::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(TrainingEnrollment::class);
    }
}
