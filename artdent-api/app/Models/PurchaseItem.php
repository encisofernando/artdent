<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    public $timestamps = false;
    protected $fillable = ['purchase_id','product_id','qty','unit_cost','line_total'];
    protected $casts = ['qty'=>'float','unit_cost'=>'float','line_total'=>'float'];
    public function purchase(){ return $this->belongsTo(Purchase::class); }
}
