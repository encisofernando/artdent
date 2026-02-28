<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Movement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'client_id',
        'date',
        'type',
        'amount',
        'description',
        'method',
        'reference',
        'job_id',
    ];

    protected $casts = [
        'date'   => 'date',
        'amount' => 'decimal:2',
    ];

    public function clinic()
    {
        return $this->belongsTo(Clinic::class, 'client_id');
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
