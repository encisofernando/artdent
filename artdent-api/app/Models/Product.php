<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'category_id',
        'vendor_id',
        'sku',
        'barcode',
        'name',
        'description',
        'unit',
        'cost',
        'price',
        'tax_rate',
        'tax_id',
        'is_active',
        'track_stock',
        'min_stock'
    ];

    protected $casts = [
        'category_id' => 'integer',
        'vendor_id' => 'integer',
        'cost' => 'float',
        'price' => 'float',
        'tax_rate' => 'float',
        'tax_id' => 'integer',
        'min_stock' => 'float',
        'is_active' => 'boolean',
        'track_stock' => 'boolean'
    ];

    /**
     * Relación con imágenes del producto
     */
    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Relación con la imagen principal
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', 1)->orderBy('sort_order')->orderBy('id');
    }

    /**
     * Relación con stock en almacenes
     */
    public function stocks()
    {
        return $this->hasMany(Stock::class);
    }

    /**
     * Relación con movimientos de stock
     */
    public function stockMovements()
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Relación con categoría
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Relación con proveedor
     */
    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    /**
     * Relación con impuesto
     */
    public function tax()
    {
        return $this->belongsTo(Tax::class);
    }

    /**
     * Obtener stock total del producto (suma de todos los almacenes)
     */
    public function getTotalStockAttribute()
    {
        return $this->stocks()->sum('qty');
    }

    /**
     * Obtener stock en un almacén específico
     */
    public function getStockInWarehouse($warehouseId)
    {
        return $this->stocks()
            ->where('warehouse_id', $warehouseId)
            ->value('qty') ?? 0;
    }

    /**
     * Verificar si el producto tiene stock bajo
     */
    public function isLowStock()
    {
        if (!$this->track_stock) {
            return false;
        }

        return $this->getTotalStockAttribute() <= $this->min_stock;
    }

    /**
     * Scope para productos activos
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope para productos con stock bajo
     */
    public function scopeLowStock($query)
    {
        return $query->where('track_stock', true)
            ->whereRaw('(SELECT COALESCE(SUM(qty), 0) FROM stocks WHERE stocks.product_id = products.id) <= products.min_stock');
    }
}
