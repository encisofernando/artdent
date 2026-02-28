<?php

namespace App\Models;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'job_id', 'type', 'description', 'supplier', 'unit',
        'unit_cost', 'quantity', 'margin', 'total', 'suggested'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function job()
    {
        return $this->belongsTo(Job::class);
    }
}
