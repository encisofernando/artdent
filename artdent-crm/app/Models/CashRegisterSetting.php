<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashRegisterSetting extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'is_enabled',
    ];

    protected $casts = [
        'company_id' => 'int',
        'is_enabled' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public static function forCompany(int $companyId): self
    {
        return static::query()->firstOrCreate(
            ['company_id' => $companyId],
            ['is_enabled' => false]
        );
    }
}
