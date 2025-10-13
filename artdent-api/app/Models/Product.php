<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'company_id','name','sku','price','tax_rate','category_id','is_active'
    ];
    protected $casts = [
        'price'=>'float',
        'tax_rate'=>'float',
        'is_active'=>'boolean'
    ];
}
