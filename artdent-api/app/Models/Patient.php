<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'first_name',
        'last_name',
        'date_of_birth',
        'gender',
        'phone',
        'email',
        'address',
        'notes',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    // ── Accessor: "name" para que el Autocomplete del frontend funcione ───────
    // El frontend usa option.name → unifica first_name + last_name
    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        return trim("{$this->last_name}, {$this->first_name}");
    }

    // ── Relaciones ────────────────────────────────────────────────────────────
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }
}
