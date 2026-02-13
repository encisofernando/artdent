<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = [
        'company_id',
        'warehouse_id',
        'product_id',
        'qty'
    ];

    protected $casts = [
        'company_id' => 'integer',
        'warehouse_id' => 'integer',
        'product_id' => 'integer',
        'qty' => 'float'
    ];

    /**
     * Relación con el producto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relación con el almacén
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Relación con la empresa
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Scope para filtrar por almacén
     */
    public function scopeInWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    /**
     * Scope para filtrar por empresa
     */
    public function scopeForCompany($query, $companyId)
    {
        return $query->where('company_id', $companyId);
    }
}
