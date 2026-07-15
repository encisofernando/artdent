<?php

namespace App\Models\Concerns;

use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Aisla el modelo por company_id usando la company activa (App\Support\CompanyContext)
 * en vez de un filtro manual por controller. Fail-closed: si no hay company
 * activa resoluble, el scope no devuelve ningún registro (nunca "todo").
 */
trait BelongsToCompany
{
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope('company', function (Builder $builder): void {
            $companyId = CompanyContext::id();
            $table = $builder->getModel()->getTable();

            if ($companyId) {
                $builder->where($table.'.company_id', $companyId);
            } else {
                $builder->whereRaw('1 = 0');
            }
        });

        static::creating(function (Model $model): void {
            if (! $model->company_id) {
                $model->company_id = CompanyContext::id();
            }
        });
    }

    public function scopeWithoutCompanyScope(Builder $query): Builder
    {
        return $query->withoutGlobalScope('company');
    }
}
