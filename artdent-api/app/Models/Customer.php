<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'company_id','code','name','tax_id','tax_condition','email','phone',
        'address','city','state','zip','credit_limit','is_active'
    ];
}
