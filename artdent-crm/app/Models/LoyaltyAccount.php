<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoyaltyAccount extends Model
{
    protected $fillable = [
        'customer_id',
        'company_id',
        'balance',
    ];

    protected $casts = [
        'customer_id' => 'int',
        'company_id' => 'int',
        'balance' => 'integer',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function moves(): HasMany
    {
        return $this->hasMany(LoyaltyMove::class);
    }

    public function applyMove(LoyaltyMove $move): void
    {
        $this->balance += $move->amount;
        $this->save();
    }
}
