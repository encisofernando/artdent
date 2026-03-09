<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabAccountMove extends Model
{
    protected $table = 'lab_account_moves';

    public $timestamps = false;

    /*
    |--------------------------------------------------------------------------
    | Movement Types
    |--------------------------------------------------------------------------
    */

    public const TYPE_CHARGE = 'charge';
    public const TYPE_PAYMENT = 'payment';
    public const TYPE_ADJUSTMENT = 'adjustment';
    public const TYPE_NOTE_CREDIT = 'note_credit';
    public const TYPE_NOTE_DEBIT = 'note_debit';

    protected $casts = [
        'lab_account_id' => 'int',
        'user_id' => 'int',
        'amount' => 'float',
        'balance_after' => 'float',
        'reference_id' => 'int',
        'payment_method_id' => 'int',
        'move_date' => 'date'
    ];

    protected $fillable = [
        'lab_account_id',
        'user_id',
        'type',
        'amount',
        'balance_after',
        'description',
        'reference_type',
        'reference_id',
        'payment_method_id',
        'move_date'
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function account(): BelongsTo
    {
        return $this->belongsTo(LabAccount::class, 'lab_account_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeCharges(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_CHARGE);
    }

    public function scopePayments(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_PAYMENT);
    }

    public function scopeForAccount(Builder $query, int $accountId): Builder
    {
        return $query->where('lab_account_id', $accountId);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function getSignedAmountAttribute(): float
    {
        return match ($this->type) {

            self::TYPE_CHARGE,
            self::TYPE_NOTE_DEBIT => $this->amount,

            self::TYPE_PAYMENT,
            self::TYPE_NOTE_CREDIT => -$this->amount,

            self::TYPE_ADJUSTMENT => $this->amount,

            default => $this->amount
        };
    }
}