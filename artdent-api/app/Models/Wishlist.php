<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wishlist extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'user_id',
        'product_id',
        'notes',
        'price_alert',
        'notify_back_in_stock',
    ];

    protected $casts = [
        'price_alert' => 'decimal:2',
        'notify_back_in_stock' => 'boolean',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    // Scopes
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeWithPriceAlerts($query)
    {
        return $query->whereNotNull('price_alert');
    }

    // Methods
    public function shouldNotifyPriceAlert(): bool
    {
        if (!$this->price_alert) {
            return false;
        }

        $currentPrice = $this->product->price_final ?? $this->product->price;
        return $currentPrice <= $this->price_alert;
    }

    public function shouldNotifyBackInStock(): bool
    {
        if (!$this->notify_back_in_stock) {
            return false;
        }

        // Check if product is back in stock
        $stock = $this->product->stock ?? 0;
        return $stock > 0;
    }
}
