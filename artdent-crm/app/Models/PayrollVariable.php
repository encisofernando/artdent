<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int|null $company_id
 * @property string $code
 * @property string $name
 * @property string $data_type
 * @property string $source
 * @property string|null $description
 * @property bool $is_active
 */
class PayrollVariable extends Model
{
    use BelongsToCompany;

    protected $casts = [
        'company_id' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'data_type',
        'source',
        'description',
        'is_active',
    ];
}
