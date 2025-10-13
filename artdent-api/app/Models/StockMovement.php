<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'company_id','warehouse_id','product_id','movement_date','type','qty','reference_type','reference_id'
    ];
    protected $casts = ['movement_date'=>'datetime','qty'=>'float'];
}
