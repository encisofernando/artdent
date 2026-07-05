<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $training_session_id
 * @property int $employee_id
 * @property string $status
 * @property float|null $score
 * @property string|null $certificate_path
 * @property Carbon|null $completed_at
 * @property TrainingSession $trainingSession
 * @property Employee $employee
 */
class TrainingEnrollment extends Model
{
    protected $casts = [
        'training_session_id' => 'int',
        'employee_id' => 'int',
        'score' => 'float',
        'completed_at' => 'datetime',
    ];

    protected $fillable = [
        'training_session_id',
        'employee_id',
        'status',
        'score',
        'certificate_path',
        'completed_at',
    ];

    public function trainingSession(): BelongsTo
    {
        return $this->belongsTo(TrainingSession::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
