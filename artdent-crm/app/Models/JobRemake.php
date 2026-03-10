<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class JobRemake
 *
 * @property int $id
 * @property int $job_id Trabajo nuevo (el rehecho)
 * @property int $original_job_id Trabajo original que se rehízo
 * @property int|null $reported_by
 * @property string $responsibility lab|dentist|patient|material|unknown
 * @property string|null $reason_category
 * @property string|null $description
 * @property float $material_cost
 * @property float $labor_cost
 * @property string $charged_to lab|dentist|insurance
 * @property Carbon|null $created_at
 * @property Job $job
 * @property Job $original_job
 * @property User|null $reported_by_user
 */
class JobRemake extends Model
{
    protected $table = 'job_remakes';

    public $timestamps = false;

    protected $dates = ['created_at'];

    protected $casts = [
        'job_id' => 'int',
        'original_job_id' => 'int',
        'reported_by' => 'int',
        'material_cost' => 'float',
        'labor_cost' => 'float',
        'created_at' => 'datetime',
    ];

    protected $fillable = [
        'job_id',
        'original_job_id',
        'reported_by',
        'responsibility',
        'reason_category',
        'description',
        'material_cost',
        'labor_cost',
        'charged_to',
    ];

    public function job(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function original_job(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Job::class, 'original_job_id');
    }

    public function reported_by_user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }
}
