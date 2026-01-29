<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CollaboratorReceipt extends Model
{
    protected $fillable = [
        'company_id',
        'collaborator_id',
        'period_from',
        'period_to',
        'hours',
        'gross',
        'extras_total',
        'discounts_total',
        'net',
        'created_by',
    ];

    protected $casts = [
        'period_from' => 'date',
        'period_to'   => 'date',
        'hours'       => 'decimal:2',
        'gross'       => 'decimal:2',
        'extras_total' => 'decimal:2',
        'discounts_total' => 'decimal:2',
        'net'         => 'decimal:2',
    ];

    public function collaborator(): BelongsTo
    {
        return $this->belongsTo(Collaborator::class);
    }
}
