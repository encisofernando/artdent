<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Dentist;

class Job extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'ticket_number',
        'clinic_id',
        'dentist_id',
        'patient_id',
        'job_type_id',
        'entry_date',
        'promised_date',
        'delivery_date',
        'work_type',
        'status',
        'priority',
        'subtotal',
        'discount',
        'tax',
        'total',
        'specifications',
        'notes',
        'internal_notes',
        'assigned_to',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'entry_date'     => 'date',
        'promised_date'  => 'date',
        'delivery_date'  => 'date',
        'subtotal'       => 'decimal:2',
        'discount'       => 'decimal:2',
        'tax'            => 'decimal:2',
        'total'          => 'decimal:2',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────
    public function company()  { return $this->belongsTo(Company::class); }
    public function clinic()   { return $this->belongsTo(Clinic::class); }
    public function dentist()  { return $this->belongsTo(Dentist::class); }
    public function patient()  { return $this->belongsTo(Patient::class); }
    public function jobType()  { return $this->belongsTo(JobType::class); }
    public function costs()    { return $this->hasMany(Cost::class); }
}
