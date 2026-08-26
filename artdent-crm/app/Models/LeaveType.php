<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $company_id
 * @property string $code
 * @property string $name
 * @property string $category
 * @property bool $paid
 * @property bool $requires_certificate
 * @property int|null $max_days_per_year
 * @property bool $is_active
 * @property Company|null $company
 * @property Collection|LeaveBalance[] $balances
 * @property Collection|LeaveRequest[] $requests
 */
class LeaveType extends Model
{
    use BelongsToCompany;

    protected $casts = [
        'company_id' => 'int',
        'paid' => 'bool',
        'requires_certificate' => 'bool',
        'max_days_per_year' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'category',
        'paid',
        'requires_certificate',
        'max_days_per_year',
        'is_active',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function balances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function requests(): HasMany
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
