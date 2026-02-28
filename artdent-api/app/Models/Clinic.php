<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Dentist;
use App\Models\Job;

class Clinic extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'address',
        'city',
        'state',
        'postal_code',
        'phone',
        'email',
        'contact_person',
        'notes',
        'is_active',
        'type',
        'cuit',
        'balance',
        'active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'active'    => 'boolean',
        'balance'   => 'decimal:2',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────
    public function company()  { return $this->belongsTo(Company::class); }
    public function dentists() { return $this->hasMany(Dentist::class); }
    public function jobs()     { return $this->hasMany(Job::class, 'clinic_id'); }
}
