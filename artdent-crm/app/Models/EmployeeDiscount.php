<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $company_id
 * @property int $employee_id
 * @property Carbon $date
 * @property string $concept
 * @property float $amount
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Employee $employee
 */
class EmployeeDiscount extends Model
{
    use BelongsToCompany;

    protected $table = 'employee_discounts';

    protected $casts = [
        'company_id' => 'int',
        'employee_id' => 'int',
        'date' => 'date:Y-m-d',
        'amount' => 'float',
    ];

    protected $fillable = [
        'company_id',
        'employee_id',
        'date',
        'concept',
        'amount',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
