<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class VariantAttributeValue
 * 
 * @property int $variant_id
 * @property int $attribute_value_id
 * 
 * @property ProductAttributeValue $product_attribute_value
 * @property ProductVariant $product_variant
 *
 * @package App\Models
 */
class VariantAttributeValue extends Model
{
    protected $table = 'variant_attribute_values';
    public $incrementing = false;
    public $timestamps = false;

    // FIX: $fillable agregado para permitir mass assignment
    protected $fillable = [
        'variant_id',
        'attribute_value_id',
    ];

    protected $casts = [
        'variant_id'          => 'int',
        'attribute_value_id'  => 'int',
    ];

    public function product_attribute_value()
    {
        return $this->belongsTo(ProductAttributeValue::class, 'attribute_value_id');
    }

    public function product_variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}