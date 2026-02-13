<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockMovement extends Model
{
    protected $fillable = [
        'company_id',
        'warehouse_id',
        'product_id',
        'movement_date',
        'type',
        'qty',
        'reference_type',
        'reference_id',
        'note'
    ];

    protected $casts = [
        'company_id' => 'integer',
        'warehouse_id' => 'integer',
        'product_id' => 'integer',
        'movement_date' => 'datetime',
        'qty' => 'float',
        'reference_id' => 'integer'
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
     * Scope para movimientos de entrada
     */
    public function scopeIn($query)
    {
        return $query->where('type', 'in');
    }

    /**
     * Scope para movimientos de salida
     */
    public function scopeOut($query)
    {
        return $query->where('type', 'out');
    }

    /**
     * Scope para filtrar por tipo de referencia
     */
    public function scopeByReference($query, $type, $id = null)
    {
        $query->where('reference_type', $type);
        
        if ($id !== null) {
            $query->where('reference_id', $id);
        }
        
        return $query;
    }

    /**
     * Scope para filtrar por fecha
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('movement_date', [$startDate, $endDate]);
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
