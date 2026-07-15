<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class AfipPointOfSale
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $branch_id
 * @property int $point_sale
 * @property string|null $label
 * @property bool $is_default
 * @property bool $is_active
 * @property Company $company
 * @property Branch|null $branch
 */
class AfipPointOfSale extends Model
{
    protected $table = 'afip_points_of_sale';

    protected $casts = [
        'company_id' => 'int',
        'branch_id' => 'int',
        'point_sale' => 'int',
        'is_default' => 'bool',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'branch_id',
        'point_sale',
        'label',
        'is_default',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Resuelve el punto de venta AFIP a usar para una venta de una sucursal
     * dada. Prioridad: PV activo asignado a esa sucursal → PV activo
     * is_default de la company → null (empresa sin PV configurado).
     */
    public static function resolveFor(int $companyId, ?int $branchId): ?self
    {
        if ($branchId) {
            $byBranch = static::query()
                ->where('company_id', $companyId)
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->first();

            if ($byBranch) {
                return $byBranch;
            }
        }

        return static::query()
            ->where('company_id', $companyId)
            ->where('is_default', true)
            ->where('is_active', true)
            ->first();
    }
}
