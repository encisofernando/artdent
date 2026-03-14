<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerAccount extends Model
{
    protected $fillable = [
        'customer_id',
        'balance',
    ];

    protected $casts = [
        'customer_id' => 'int',
        'balance' => 'float',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function moves(): HasMany
    {
        return $this->hasMany(CustomerAccountMove::class);
    }

    public function applyMove(CustomerAccountMove $move): void
    {
        $this->balance += $move->signed_amount;
        $this->save();
    }
}
