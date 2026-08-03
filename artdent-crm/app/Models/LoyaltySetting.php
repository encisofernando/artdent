<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LoyaltySetting extends Model
{
    protected $fillable = [
        'company_id',
        'is_enabled',
        'accrual_percentage',
        'min_purchase_amount',
        'max_redemption_percentage',
    ];

    protected $casts = [
        'company_id' => 'int',
        'is_enabled' => 'boolean',
        'accrual_percentage' => 'float',
        'min_purchase_amount' => 'float',
        'max_redemption_percentage' => 'float',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public static function forCompany(int $companyId): self
    {
        return static::query()->firstOrCreate(
            ['company_id' => $companyId],
            ['is_enabled' => false, 'accrual_percentage' => 0]
        );
    }
}
