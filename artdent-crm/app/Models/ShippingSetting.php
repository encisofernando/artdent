<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingSetting extends Model
{
    protected $fillable = [
        'company_id',
        'free_shipping_enabled',
        'free_shipping_minimum_amount',
    ];

    protected $casts = [
        'company_id' => 'int',
        'free_shipping_enabled' => 'boolean',
        'free_shipping_minimum_amount' => 'float',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public static function forCompany(int $companyId): self
    {
        return static::query()->firstOrCreate(
            ['company_id' => $companyId],
            ['free_shipping_enabled' => false]
        );
    }
}
