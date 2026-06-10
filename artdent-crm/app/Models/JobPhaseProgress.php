<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobPhaseProgress extends Model
{
    const STATUS_PENDING = 'pending';

    const STATUS_IN_PROGRESS = 'in_progress';

    const STATUS_PRUEBA = 'prueba';

    const STATUS_COMPLETED = 'completed';

    protected $table = 'job_phase_progress';

    protected $fillable = [
        'job_id',
        'tariff_phase_id',
        'collaborator_id',
        'status',
        'started_at',
        'completed_at',
        'lab_account_move_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function tariffPhase(): BelongsTo
    {
        return $this->belongsTo(TariffPhase::class);
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }

    public function labAccountMove(): BelongsTo
    {
        return $this->belongsTo(LabAccountMove::class);
    }

    public function ticket(): HasOne
    {
        return $this->hasOne(JobPhaseTicket::class);
    }
}
