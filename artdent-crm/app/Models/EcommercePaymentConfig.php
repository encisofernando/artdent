<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EcommercePaymentConfig extends Model
{
    protected $fillable = [
        'type',
        'label',
        'is_enabled',
        'config',
        'instructions',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'config' => 'array',
        ];
    }

    public static function isMaskedSecretValue(?string $value): bool
    {
        if (! is_string($value)) {
            return false;
        }

        $value = trim($value);

        if ($value === '') {
            return false;
        }

        return str_contains($value, '••••')
            || preg_match('/^[•*]{4,}.+/u', $value) === 1;
    }

    public static function maskSecret(?string $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return $value;
        }

        return '••••••••'.substr($value, -6);
    }

    public function configValue(string $key, ?string $fallback = null): ?string
    {
        $value = $this->config[$key] ?? null;

        if (self::isMaskedSecretValue($value)) {
            return $fallback;
        }

        return $value ?? $fallback;
    }

    public function toMaskedArray(): array
    {
        $data = $this->toArray();

        if ($this->type === 'mercadopago' && isset($data['config']) && is_array($data['config'])) {
            foreach (['access_token', 'webhook_secret'] as $key) {
                if (! empty($data['config'][$key])) {
                    $data['config'][$key] = self::maskSecret($data['config'][$key]);
                }
            }
        }

        if ($this->type === 'nave' && isset($data['config']) && is_array($data['config'])) {
            foreach (['client_secret'] as $key) {
                if (! empty($data['config'][$key])) {
                    $data['config'][$key] = self::maskSecret($data['config'][$key]);
                }
            }
        }

        return $data;
    }
}
