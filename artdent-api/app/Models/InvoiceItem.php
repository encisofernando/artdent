<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    public $timestamps = false;
    protected $fillable = ['invoice_id','product_id','qty','unit_price','line_total','tax_rate'];
    protected $casts = ['qty'=>'float','unit_price'=>'float','line_total'=>'float','tax_rate'=>'float'];

    public function invoice(){ return $this->belongsTo(Invoice::class); }
}
