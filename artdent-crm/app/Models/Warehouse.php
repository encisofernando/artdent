<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Warehouse
 *
 * @property int $id
 * @property int $company_id
 * @property int|null $branch_id
 * @property string $name
 * @property string|null $code
 * @property string|null $address
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Company $company
 * @property Collection|Purchase[] $purchases
 * @property Collection|StockMovement[] $stock_movements
 * @property Collection|Stock[] $stocks
 */
class Warehouse extends Model
{
    use BelongsToCompany;

    protected $table = 'warehouses';

    protected $casts = [
        'company_id' => 'int',
        'branch_id' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'branch_id',
        'name',
        'code',
        'address',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function purchases()
    {
        return $this->hasMany(Purchase::class);
    }

    public function stock_movements()
    {
        return $this->hasMany(StockMovement::class);
    }

    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }
}
