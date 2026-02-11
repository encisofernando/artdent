<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ProductImage extends Model
{
    protected $fillable = [
        'company_id',
        'product_id',
        'path',
        'alt',
        'sort_order',
        'is_primary',
    ];

    protected $casts = [
        'company_id' => 'integer',
        'product_id' => 'integer',
        'sort_order' => 'integer',
        'is_primary' => 'boolean',
    ];

    protected $appends = ['url'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getUrlAttribute(): string
    {
        // Requiere: php artisan storage:link
        return Storage::disk('public')->url($this->path);
    }
}
