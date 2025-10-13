<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sale extends Model
{
    protected $fillable = [
        'company_id','warehouse_id','cashier_id','customer_id','sale_date','status',
        'subtotal','tax_total','total'
    ];
    protected $casts = [
        'sale_date'=>'datetime',
        'subtotal'=>'float','tax_total'=>'float','total'=>'float'
    ];

    public function items(){ return $this->hasMany(SaleItem::class); }
    public function customer(){ return $this->belongsTo(Customer::class); }
}
