<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabAccountPaymentReport extends Model
{
    const STATUS_PENDING = 'pending';

    const STATUS_APPROVED = 'approved';

    const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'lab_account_id',
        'dentist_id',
        'amount',
        'payment_method_id',
        'image_url',
        'notes',
        'status',
        'lab_account_move_id',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'reviewed_at' => 'datetime',
        ];
    }

    public function labAccount(): BelongsTo
    {
        return $this->belongsTo(LabAccount::class);
    }

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(Dentist::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function labAccountMove(): BelongsTo
    {
        return $this->belongsTo(LabAccountMove::class);
    }
}
