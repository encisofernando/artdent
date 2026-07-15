<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Fila única (singleton): identidad AFIP con la que ArtCode emite comprobantes
 * a sus tenants por la suscripción SaaS. Separada de la identidad AFIP propia
 * de cada tenant (tabla `companies`, por-tenant).
 */
class AfipIssuerSetting extends Model
{
    protected $fillable = [
        'name',
        'cuit',
        'iva_condition',
        'point_sale',
        'environment',
        'cert_path',
        'homo_cert_path',
        'key_path',
        'auto_invoice',
    ];

    protected $casts = [
        'point_sale' => 'integer',
        'auto_invoice' => 'boolean',
    ];

    public static function current(): ?self
    {
        return static::first();
    }

    public function certPath(?string $environment = null): ?string
    {
        $environment ??= $this->environment;

        return $environment === 'homo' ? $this->homo_cert_path : $this->cert_path;
    }
}
