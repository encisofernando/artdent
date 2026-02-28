<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobPayment extends Model
{
    protected $table = 'job_payments';

    protected $fillable = [
        'company_id',
        'job_id',
        'amount',
        'payment_method',
        'payment_date',
        'reference',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'amount'       => 'decimal:2',
        'payment_date' => 'date',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────
    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function job(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Job::class);
    }

    public function createdBy(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
