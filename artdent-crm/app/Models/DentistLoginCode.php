<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class DentistLoginCode
 *
 * @property int $id
 * @property int $dentist_id
 * @property string $code
 * @property int $attempts
 * @property Carbon $expires_at
 * @property Carbon|null $used_at
 * @property Dentist $dentist
 */
class DentistLoginCode extends Model
{
    protected $table = 'dentist_login_codes';

    protected $casts = [
        'dentist_id' => 'int',
        'attempts' => 'int',
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    protected $fillable = [
        'dentist_id',
        'code',
        'attempts',
        'expires_at',
        'used_at',
    ];

    public function dentist(): BelongsTo
    {
        return $this->belongsTo(Dentist::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }
}
