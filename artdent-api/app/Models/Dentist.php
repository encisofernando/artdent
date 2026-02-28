<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Dentist extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'user_id',
        'clinic_id',
        'license_number',
        'specialty',
        'phone',
        'email',
        'notes',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // ── Accessor: "name" para Autocomplete del frontend ───────────────────────
    // El nombre real viene del User relacionado.
    // Fallback a email si no hay user vinculado.
    protected $appends = ['name'];

    public function getNameAttribute(): string
    {
        return $this->user?->name ?? $this->email ?? "Dentista #{$this->id}";
    }

    // ── Relaciones ────────────────────────────────────────────────────────────
    public function company(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function clinic(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function jobs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Job::class);
    }

    public function patients(): \Illuminate\Database\Eloquent\Relations\HasManyThrough
    {
        return $this->hasManyThrough(Patient::class, Job::class, 'dentist_id', 'id', 'id', 'patient_id');
    }

    // ── Scope ─────────────────────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
