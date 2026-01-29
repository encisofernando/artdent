<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Collaborator extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'document',
        'hourly_rate',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'hourly_rate' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(CollaboratorAttendance::class);
    }

    public function extras(): HasMany
    {
        return $this->hasMany(CollaboratorExtra::class);
    }

    public function discounts(): HasMany
    {
        return $this->hasMany(CollaboratorDiscount::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(CollaboratorReceipt::class);
    }
}
