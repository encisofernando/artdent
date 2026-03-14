<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerAccountMove extends Model
{
    public const TYPE_CHARGE = 'charge';

    public const TYPE_PAYMENT = 'payment';

    public const TYPE_ADJUSTMENT = 'adjustment';

    protected $fillable = [
        'customer_account_id',
        'user_id',
        'type',
        'amount',
        'balance_after',
        'description',
        'reference_type',
        'reference_id',
        'payment_method_id',
        'move_date',
    ];

    protected $casts = [
        'customer_account_id' => 'int',
        'user_id' => 'int',
        'amount' => 'float',
        'balance_after' => 'float',
        'reference_id' => 'int',
        'payment_method_id' => 'int',
        'move_date' => 'date',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(CustomerAccount::class, 'customer_account_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class);
    }

    public function scopeCharges(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_CHARGE);
    }

    public function scopePayments(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_PAYMENT);
    }

    public function getSignedAmountAttribute(): float
    {
        return match ($this->type) {
            self::TYPE_CHARGE => $this->amount,
            self::TYPE_PAYMENT => -$this->amount,
            default => $this->amount,
        };
    }
}
