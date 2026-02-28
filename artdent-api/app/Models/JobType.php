<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'description',
        'base_price',
        'estimated_days',
        'color',
        'is_active',
    ];

    protected $casts = [
        'base_price'     => 'decimal:2',
        'estimated_days' => 'integer',
        'is_active'      => 'boolean',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function jobs()
    {
        return $this->hasMany(Job::class);
    }

    // ── Scope: solo activos ───────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
