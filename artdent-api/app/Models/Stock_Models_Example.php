<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Modelo Stock
 * Tabla: stock
 * Relación: Almacena la cantidad de cada producto en cada almacén
 */
class Stock extends Model
{
    protected $table = 'stock';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }
}

/**
 * Modelo StockMovement
 * Tabla: stock_movements
 * Relación: Historial de todos los movimientos de stock
 */
class StockMovement extends Model
{
    protected $table = 'stock_movements';

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'type',          // 'in' o 'out'
        'quantity',
        'reason',
        'notes',
        'user_id',
        'date',
        'reference_type', // 'sale', 'purchase', 'adjustment', etc.
        'reference_id',   // ID de la venta, compra, etc.
    ];

    protected $casts = [
        'quantity' => 'integer',
        'date' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

/**
 * Agregar estas relaciones al modelo Product existente
 */
// En app/Models/Product.php, agregar:

use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    // ... código existente ...

    /**
     * Obtener el stock de este producto en todos los almacenes
     */
    public function stock(): HasMany
    {
        return $this->hasMany(Stock::class);
    }

    /**
     * Obtener todos los movimientos de stock de este producto
     */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Obtener el stock total sumando todos los almacenes
     */
    public function getTotalStockAttribute(): int
    {
        return $this->stock()->sum('quantity');
    }

    /**
     * Obtener el stock en un almacén específico
     */
    public function getStockInWarehouse($warehouseId): int
    {
        return $this->stock()
            ->where('warehouse_id', $warehouseId)
            ->value('quantity') ?? 0;
    }
}
