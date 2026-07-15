<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Class ProductBarcode
 *
 * Códigos de barra adicionales de un artículo (ej: código del proveedor, presentación
 * en caja/pack), además del código de barras principal en `products.barcode`.
 *
 * @property int $id
 * @property int $product_id
 * @property int|null $variant_id
 * @property string $barcode
 * @property string|null $label
 * @property Product $product
 * @property ProductVariant|null $variant
 */
class ProductBarcode extends Model
{
    protected $table = 'product_barcodes';

    protected $casts = [
        'product_id' => 'int',
        'variant_id' => 'int',
    ];

    protected $fillable = [
        'product_id',
        'variant_id',
        'barcode',
        'label',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
