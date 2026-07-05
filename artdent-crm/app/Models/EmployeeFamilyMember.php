<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $employee_id
 * @property string $name
 * @property string $relationship
 * @property string|null $dni
 * @property Carbon|null $birth_date
 * @property bool $disability
 * @property Employee $employee
 */
class EmployeeFamilyMember extends Model
{
    protected $table = 'employee_family_members';

    protected $casts = [
        'employee_id' => 'int',
        'birth_date' => 'date:Y-m-d',
        'disability' => 'bool',
    ];

    protected $fillable = [
        'employee_id',
        'name',
        'relationship',
        'dni',
        'birth_date',
        'disability',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
