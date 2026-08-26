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
 * Class JobType
 *
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string|null $color
 * @property bool|null $is_active
 * @property Carbon|null $created_at
 * @property Company $company
 * @property Collection|Job[] $jobs
 */
class JobType extends Model
{
    use BelongsToCompany;

    protected $table = 'job_types';

    public $timestamps = false;

    protected $casts = [
        'company_id' => 'int',
        'is_active' => 'bool',
    ];

    protected $fillable = [
        'company_id',
        'name',
        'color',
        'is_active',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
