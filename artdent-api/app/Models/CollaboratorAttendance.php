<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollaboratorAttendance extends Model
{
    protected $fillable = [
        'company_id',
        'collaborator_id',
        'work_date',
        'time_in',
        'time_out',
        'hours',
        'amount',
        'notes',
    ];

    protected $casts = [
        'work_date' => 'date',
        'hours'     => 'decimal:2',
        'amount'    => 'decimal:2',
    ];

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }
}
