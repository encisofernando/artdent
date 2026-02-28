<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tariff extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id', 'code', 'name', 'category', 'unit', 'active',
        'base_price', 'price_a', 'price_b', 'price_cli', 'price_lab'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
