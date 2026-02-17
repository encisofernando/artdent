<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sale extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'warehouse_id',
        'cashier_id',
        'customer_id',
        'number',
        'status',
        'sale_date',
        'subtotal',
        'discount_total',
        'tax_total',
        'total',
        'currency',
        'observations',
    ];

    protected $casts = [
        'sale_date' => 'datetime',
        'subtotal' => 'float',
        'discount_total' => 'float',
        'tax_total' => 'float',
        'total' => 'float',
    ];

    /**
     * Relación con ítems de la venta
     */
    public function items()
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Relación con cliente
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Relación con cajero
     */
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * Relación con almacén
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Relación con empresa
     */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Relación con sucursal
     */
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Scope para ventas confirmadas
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope para ventas de hoy
     */
    public function scopeToday($query)
    {
        return $query->whereDate('sale_date', today());
    }

    /**
     * Scope para ventas del mes actual
     */
    public function scopeThisMonth($query)
    {
        return $query->whereMonth('sale_date', now()->month)
                    ->whereYear('sale_date', now()->year);
    }

    /**
     * Obtener total de ítems
     */
    public function getTotalItemsAttribute()
    {
        return $this->items->sum('qty');
    }

    /**
     * Verificar si la venta puede ser cancelada
     */
    public function canBeCancelled()
    {
        return $this->status !== 'cancelled';
    }
}
