<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaleItem extends Model
{
    protected $fillable = [
        'sale_id',
        'product_id',
        'description',
        'qty',
        'unit_price',
        'discount',
        'tax_id',
        'tax_rate',
        'tax_amount',
        'line_total',
    ];

    protected $casts = [
        'sale_id' => 'integer',
        'product_id' => 'integer',
        'tax_id' => 'integer',
        'qty' => 'float',
        'unit_price' => 'float',
        'discount' => 'float',
        'tax_rate' => 'float',
        'tax_amount' => 'float',
        'line_total' => 'float',
    ];

    /**
     * Relación con la venta
     */
    public function sale()
    {
        return $this->belongsTo(Sale::class);
    }

    /**
     * Relación con el producto
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relación con el impuesto
     */
    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }

    /**
     * Calcular subtotal sin descuento
     */
    public function getSubtotalAttribute()
    {
        return $this->qty * $this->unit_price;
    }

    /**
     * Calcular subtotal con descuento
     */
    public function getSubtotalWithDiscountAttribute()
    {
        return $this->subtotal - $this->discount;
    }

    /**
     * Obtener el porcentaje de descuento
     */
    public function getDiscountPercentAttribute()
    {
        if ($this->subtotal == 0) return 0;
        return ($this->discount / $this->subtotal) * 100;
    }
}
