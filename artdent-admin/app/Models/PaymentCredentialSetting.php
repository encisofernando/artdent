<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Fila única (singleton): credenciales de Mercado Pago y Nave con las que
 * ArtCode cobra la suscripción SaaS de sus tenants. Los secretos
 * (mp_access_token, nave_client_secret) se guardan encriptados en DB y nunca
 * viajan completos al frontend — ver PaymentCredentialController::edit().
 */
class PaymentCredentialSetting extends Model
{
    protected $fillable = [
        'mp_public_key',
        'mp_access_token',
        'nave_client_id',
        'nave_client_secret',
        'nave_pos_id',
        'nave_sandbox_mode',
    ];

    protected $casts = [
        'mp_access_token' => 'encrypted',
        'nave_client_secret' => 'encrypted',
        'nave_sandbox_mode' => 'boolean',
    ];

    public static function current(): ?self
    {
        return static::first();
    }

    /** Últimos 4 caracteres de un secreto, para mostrar sin exponerlo entero. */
    public static function mask(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        return str_repeat('•', 8).substr($value, -4);
    }
}
