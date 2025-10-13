<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Purchase extends Model
{
    protected $fillable = [
        'company_id','warehouse_id','supplier_id','invoice_number','purchase_date',
        'status','subtotal','tax_total','total'
    ];
    protected $casts = [
        'purchase_date'=>'datetime',
        'subtotal'=>'float','tax_total'=>'float','total'=>'float'
    ];
    public function items(){ return $this->hasMany(PurchaseItem::class); }
}
