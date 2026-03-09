<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LabAccount extends Model
{
    protected $table = 'lab_accounts';

    protected $casts = [
        'dentist_id' => 'int',
        'balance' => 'float',
    ];

    protected $fillable = [
        'dentist_id',
        'balance'
    ];

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(Dentist::class);
    }

    public function moves(): HasMany
    {
        return $this->hasMany(LabAccountMove::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Business Logic
    |--------------------------------------------------------------------------
    */

    public function applyMove(LabAccountMove $move): void
    {
        $this->balance += $move->signed_amount;
        $this->save();
    }
}