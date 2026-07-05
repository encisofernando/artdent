<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string|null $provider
 * @property int|null $hours
 * @property string|null $category
 * @property Company $company
 * @property Collection|TrainingSession[] $sessions
 */
class Training extends Model
{
    protected $casts = [
        'company_id' => 'int',
        'hours' => 'int',
    ];

    protected $fillable = [
        'company_id',
        'name',
        'provider',
        'hours',
        'category',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TrainingSession::class);
    }
}
