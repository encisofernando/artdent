<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabAccountMpPayment extends Model
{
    const STATUS_PENDING = 'pending';

    const STATUS_APPROVED = 'approved';

    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'dentist_id',
        'lab_account_id',
        'amount',
        'external_reference',
        'mp_payment_id',
        'status',
        'lab_account_move_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
        ];
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(Dentist::class);
    }

    public function labAccount(): BelongsTo
    {
        return $this->belongsTo(LabAccount::class);
    }

    public function labAccountMove(): BelongsTo
    {
        return $this->belongsTo(LabAccountMove::class);
    }
}
