<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    public $timestamps = false;
    protected $fillable = ['sale_id','product_id','qty','unit_price','line_total'];
    protected $casts = ['qty'=>'float','unit_price'=>'float','line_total'=>'float'];

    public function sale(){ return $this->belongsTo(Sale::class); }
}
