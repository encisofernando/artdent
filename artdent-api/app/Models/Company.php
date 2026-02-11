<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = ['name','legal_name','tax_id','email','b2b_discount_percent'];

    protected $casts = [
        'b2b_discount_percent' => 'float',
    ];
}
