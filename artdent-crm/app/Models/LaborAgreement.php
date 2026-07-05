<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int|null $company_id
 * @property string $name
 * @property string|null $code
 * @property string|null $description
 * @property bool $is_active
 * @property Collection|LaborAgreementCategory[] $categories
 */
class LaborAgreement extends Model
{
    use SoftDeletes;

    protected $casts = [
        'company_id' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'description',
        'is_active',
    ];

    public function categories(): HasMany
    {
        return $this->hasMany(LaborAgreementCategory::class);
    }
}
