<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPhaseTicket extends Model
{
    protected $fillable = [
        'job_id',
        'job_phase_progress_id',
        'collaborator_id',
        'ticket_number',
        'phase_name',
        'amount',
        'printed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'printed_at' => 'datetime',
        ];
    }

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function phaseProgress(): BelongsTo
    {
        return $this->belongsTo(JobPhaseProgress::class, 'job_phase_progress_id');
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }
}
