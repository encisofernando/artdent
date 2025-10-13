<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $fillable = [
        'company_id','sale_id','invoice_type_id','pos_number','invoice_number',
        'issue_date','customer_name','subtotal','tax_total','total','status',
        'cae','cae_due_date','arca_response'
    ];
    protected $casts = [
        'issue_date'=>'datetime',
        'subtotal'=>'float','tax_total'=>'float','total'=>'float',
        'arca_response'=>'array',
    ];

    public function items(){ return $this->hasMany(InvoiceItem::class); }
    public function type(){ return $this->belongsTo(InvoiceType::class,'invoice_type_id'); }
    public function sale(){ return $this->belongsTo(Sale::class); }
}
