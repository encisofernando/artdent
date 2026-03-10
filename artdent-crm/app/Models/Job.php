<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Job
 *
 * @property int $id
 * @property int $company_id
 * @property int $dentist_id
 * @property int|null $patient_id
 * @property int|null $job_type_id
 * @property int|null $assigned_user_id
 * @property string $job_number
 * @property string|null $status
 * @property string|null $priority
 * @property string|null $description
 * @property string|null $clinical_notes
 * @property string|null $shade
 * @property Carbon|null $received_at
 * @property Carbon|null $due_date
 * @property Carbon|null $delivered_at
 * @property float|null $subtotal
 * @property float|null $discount_amount
 * @property float|null $total
 * @property bool|null $billed
 * @property int|null $invoice_id
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $deleted_at
 * @property Company $company
 * @property Dentist $dentist
 * @property Patient|null $patient
 * @property JobType|null $job_type
 * @property User|null $user
 * @property Collection|JobAttachment[] $job_attachments
 * @property Collection|Collaborator[] $collaborators
 * @property Collection|JobItem[] $job_items
 * @property Collection|JobStatusHistory[] $job_status_histories
 * @property Collection|JobTeeth[] $job_teeths
 */
class Job extends Model
{
    use SoftDeletes;

    protected $table = 'jobs';

    protected $casts = [
        'company_id' => 'int',
        'dentist_id' => 'int',
        'patient_id' => 'int',
        'job_type_id' => 'int',
        'assigned_user_id' => 'int',
        'remake_of_job_id' => 'int',
        'received_at' => 'datetime',
        'due_date' => 'datetime',
        'pickup_date' => 'date',
        'delivered_at' => 'datetime',
        'subtotal' => 'float',
        'discount_amount' => 'float',
        'urgency_fee' => 'float',
        'total' => 'float',
        'billed' => 'bool',
        'invoice_id' => 'int',
        'estimated_days' => 'int',
    ];

    protected $fillable = [
        'company_id',
        'dentist_id',
        'patient_id',
        'job_type_id',
        'assigned_user_id',
        'job_number',
        'status',
        'priority',
        'description',
        'clinical_notes',
        'shade',
        'color_system',
        'sector',
        'received_at',
        'due_date',
        'pickup_date',
        'delivered_at',
        'subtotal',
        'discount_amount',
        'urgency_fee',
        'total',
        'delivery_method',
        'remake_of_job_id',
        'remake_reason',
        'lab_technician_notes',
        'estimated_days',
        'billed',
        'invoice_id',
        'notes',
    ];

    // ── Relaciones snake_case (originales) ────────────────────────────────────

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function dentist()
    {
        return $this->belongsTo(Dentist::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function job_type()
    {
        return $this->belongsTo(JobType::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'assigned_user_id');
    }

    public function job_attachments()
    {
        return $this->hasMany(JobAttachment::class);
    }

    public function collaborators()
    {
        return $this->belongsToMany(Collaborator::class, 'job_collaborators')
            ->withPivot('id', 'assigned_by', 'role', 'assigned_at', 'completed_at', 'notes')
            ->withTimestamps();
    }

    public function job_items()
    {
        return $this->hasMany(JobItem::class);
    }

    public function job_status_histories()
    {
        return $this->hasMany(JobStatusHistory::class);
    }

    public function job_teeths()
    {
        return $this->hasMany(JobTeeth::class);
    }

    // ── Alias camelCase — requeridos por JobController@show y @edit ───────────
    // Laravel usa el nombre del método para eager loading:
    //   $job->load(['jobType', 'items']) → requiere estos métodos

    /** Alias de job_type() para eager loading camelCase */
    public function jobType()
    {
        return $this->belongsTo(JobType::class);
    }

    /** Alias de job_items() — usado como 'items' en load([]) */
    public function items()
    {
        return $this->hasMany(JobItem::class);
    }

    /** Trabajo original del que derivó este rehecho */
    public function original_job()
    {
        return $this->belongsTo(Job::class, 'remake_of_job_id');
    }

    /** Rehechos generados a partir de este trabajo */
    public function remakes()
    {
        return $this->hasMany(Job::class, 'remake_of_job_id');
    }

    /** Registro formal de rehecho */
    public function job_remake()
    {
        return $this->hasOne(JobRemake::class, 'job_id');
    }
}
