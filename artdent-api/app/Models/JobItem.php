<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobItem extends Model
{
    protected $table = 'job_items';

    protected $fillable = [
        'job_id',
        'tariff_id',
        'qty',
        'price',
        'total',
        'pieces',
        'name',
        'notes',
    ];

    protected $casts = [
        'qty'   => 'integer',
        'price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function job()
    {
        return $this->belongsTo(Job::class);
    }

    public function tariff()
    {
        return $this->belongsTo(Tariff::class);
    }
}
