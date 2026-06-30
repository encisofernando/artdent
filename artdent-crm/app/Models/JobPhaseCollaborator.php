<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPhaseCollaborator extends Model
{
    protected $fillable = [
        'job_phase_progress_id',
        'collaborator_id',
        'commission_share',
    ];

    protected function casts(): array
    {
        return [
            'commission_share' => 'float',
        ];
    }

    public function phase(): BelongsTo
    {
        return $this->belongsTo(JobPhaseProgress::class, 'job_phase_progress_id');
    }

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }
}
