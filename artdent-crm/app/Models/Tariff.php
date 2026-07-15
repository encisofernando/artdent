<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Tariff
 *
 * @property int $id
 * @property int $company_id
 * @property string|null $code
 * @property string $name
 * @property string|null $category
 * @property float $price
 * @property float $margin_pct
 * @property string|null $unit
 * @property string|null $description
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Company $company
 * @property Collection|Dentist[] $dentists
 * @property Collection|JobItem[] $job_items
 */
class Tariff extends Model
{
    protected $table = 'tariffs';

    protected $casts = [
        'company_id' => 'int',
        'price' => 'float',
        'margin_pct' => 'float',
        'is_active' => 'bool',
        'min_days' => 'int',
        'tooth_count' => 'int',
        'urgency_multiplier' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'category',
        'lab_sector',
        'min_days',
        'urgency_multiplier',
        'tooth_count',
        'price',
        'margin_pct',
        'unit',
        'description',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function costs()
    {
        return $this->hasMany(TariffCost::class);
    }

    public function dentists()
    {
        return $this->belongsToMany(Dentist::class, 'dentist_tariff_prices')
            ->withPivot('id', 'price')
            ->withTimestamps();
    }

    public function job_items()
    {
        return $this->hasMany(JobItem::class);
    }

    public function phases()
    {
        return $this->hasMany(TariffPhase::class)->orderBy('sort_order');
    }
}
