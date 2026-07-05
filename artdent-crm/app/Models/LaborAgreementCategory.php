<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $labor_agreement_id
 * @property string $name
 * @property string|null $code
 * @property int $order
 * @property bool $is_active
 * @property LaborAgreement $laborAgreement
 * @property Collection|SalaryScale[] $salaryScales
 * @property Collection|Employee[] $employees
 */
class LaborAgreementCategory extends Model
{
    use SoftDeletes;

    protected $casts = [
        'labor_agreement_id' => 'int',
        'order' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'labor_agreement_id',
        'name',
        'code',
        'order',
        'is_active',
    ];

    public function laborAgreement(): BelongsTo
    {
        return $this->belongsTo(LaborAgreement::class);
    }

    public function salaryScales(): HasMany
    {
        return $this->hasMany(SalaryScale::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }

    public function currentScale(): ?SalaryScale
    {
        $today = now()->toDateString();

        return $this->salaryScales()
            ->where('effective_from', '<=', $today)
            ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', $today))
            ->orderByDesc('effective_from')
            ->first();
    }
}
