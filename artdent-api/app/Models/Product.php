<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
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
        'min_stock' => 'integer',
        'is_active' => 'boolean',
        'track_stock' => 'boolean'
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order')->orderBy('id');
    }

    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', 1)->orderBy('sort_order')->orderBy('id');
    }
}
