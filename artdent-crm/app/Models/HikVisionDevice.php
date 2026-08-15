<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Crypt;

class HikVisionDevice extends Model
{
    use BelongsToCompany;

    protected $table = 'hikvision_devices';

    protected $fillable = [
        'company_id',
        'name',
        'device_model',
        'connection_type',
        'serial_no',
        'ip_address',
        'mac_address',
        'port',
        'username',
        'password_enc',
        'isup_verify_code',
        'webhook_secret',
        'isup_account_id',
        'isup_status',
        'isup_last_connected_at',
        'isup_last_disconnected_at',
        'is_active',
        'last_heartbeat_at',
        'firmware_version',
        'notes',
    ];

    protected $appends = ['isup_effective_status'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_heartbeat_at' => 'datetime',
            'isup_last_connected_at' => 'datetime',
            'isup_last_disconnected_at' => 'datetime',
            'port' => 'integer',
        ];
    }

    /**
     * isup_status queda pegado en "connected" para siempre si el listener se
     * cuelga sin llegar a mandar el evento de desconexión — no hay ningún
     * heartbeat periódico que lo refresque mientras tanto. Este accessor
     * recalcula el estado real comparando isup_last_connected_at contra un
     * umbral de obsolescencia, en vez de confiar ciegamente en el flag
     * guardado. Usar esto (no isup_status directo) en cualquier lugar que
     * muestre el estado de conexión al usuario.
     */
    public function getIsupEffectiveStatusAttribute(): ?string
    {
        if ($this->isup_status !== 'connected') {
            return $this->isup_status;
        }

        $staleAfterSeconds = (int) config('services.isup_listener.stale_after_seconds', 600);

        if (! $this->isup_last_connected_at || $this->isup_last_connected_at->diffInSeconds(now()) > $staleAfterSeconds) {
            return 'stale';
        }

        return 'connected';
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
