<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Class PhaseTemplate
 *
 * Catálogo de fases de producción reutilizables entre aranceles (ej. "Diseño",
 * "Fresado", "Pigmentado"), cada una con un precio único administrado en un solo lugar.
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property float $price
 * @property bool $is_active
 * @property Company $company
 * @property \Illuminate\Database\Eloquent\Collection|TariffPhase[] $tariffPhases
 */
class PhaseTemplate extends Model
{
    protected $table = 'phase_templates';

    protected function casts(): array
    {
        return [
            'company_id' => 'int',
            'price' => 'float',
            'is_active' => 'bool',
        ];
    }

    protected $fillable = [
        'company_id',
        'name',
        'price',
        'is_active',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function tariffPhases(): HasMany
    {
        return $this->hasMany(TariffPhase::class);
    }
}
