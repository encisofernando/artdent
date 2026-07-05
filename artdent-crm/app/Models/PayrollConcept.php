<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int|null $company_id
 * @property string $code
 * @property string $name
 * @property string $type
 * @property string|null $category
 * @property string $calculation_type
 * @property bool $affects_sac
 * @property bool $affects_vacation
 * @property bool $is_active
 * @property int $order
 * @property Collection|PayrollConceptVersion[] $versions
 */
class PayrollConcept extends Model
{
    use SoftDeletes;

    protected $casts = [
        'company_id' => 'int',
        'affects_sac' => 'bool',
        'affects_vacation' => 'bool',
        'is_active' => 'bool',
        'order' => 'int',
    ];

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'type',
        'category',
        'calculation_type',
        'affects_sac',
        'affects_vacation',
        'is_active',
        'order',
    ];

    public function versions(): HasMany
    {
        return $this->hasMany(PayrollConceptVersion::class);
    }

    public function currentVersion(): ?PayrollConceptVersion
    {
        $today = now()->toDateString();

        return $this->versions()
            ->where('effective_from', '<=', $today)
            ->where(fn ($q) => $q->whereNull('effective_to')->orWhere('effective_to', '>=', $today))
            ->orderByDesc('effective_from')
            ->first();
    }
}
