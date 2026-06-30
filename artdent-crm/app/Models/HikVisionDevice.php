<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class HikVisionDevice extends Model
{
    protected $table = 'hikvision_devices';

    protected $fillable = [
        'company_id',
        'name',
        'device_model',
        'serial_no',
        'ip_address',
        'port',
        'username',
        'password_enc',
        'isup_verify_code',
        'webhook_secret',
        'is_active',
        'last_heartbeat_at',
        'firmware_version',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_heartbeat_at' => 'datetime',
            'port' => 'integer',
        ];
    }

    /** Base URL para llamadas ISAPI */
    public function baseUrl(): string
    {
        $scheme = $this->port === 443 ? 'https' : 'http';

        return "{$scheme}://{$this->ip_address}:{$this->port}";
    }

    public function setPasswordAttribute(string $value): void
    {
        $this->attributes['password_enc'] = Crypt::encryptString($value);
    }

    public function getPasswordAttribute(): string
    {
        return Crypt::decryptString($this->attributes['password_enc']);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(HikVisionEvent::class, 'device_id');
    }
}
