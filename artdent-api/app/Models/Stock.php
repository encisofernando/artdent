<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    public $timestamps = false;
    protected $fillable = ['company_id','warehouse_id','product_id','qty'];
    protected $casts = ['qty'=>'float'];

    public function product(){ return $this->belongsTo(Product::class); }
}
