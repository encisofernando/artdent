<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorAccount extends Model
{
    protected $table = 'vendor_accounts';

    protected $fillable = [
        'vendor_id',
        'company_id',
        'balance',
    ];

    protected function casts(): array
    {
        return [
            'vendor_id' => 'int',
            'company_id' => 'int',
            'balance' => 'float',
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function moves(): HasMany
    {
        return $this->hasMany(VendorAccountMove::class);
    }
}
