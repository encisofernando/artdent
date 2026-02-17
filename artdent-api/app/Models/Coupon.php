<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'code',
        'name',
        'description',
        'type',
        'discount_value',
        'min_purchase',
        'max_discount',
        'max_uses',
        'max_uses_per_user',
        'current_uses',
        'valid_from',
        'valid_until',
        'applicable_categories',
        'applicable_products',
        'first_purchase_only',
        'is_active',
    ];

    protected $casts = [
        'discount_value' => 'decimal:2',
        'min_purchase' => 'decimal:2',
        'max_discount' => 'decimal:2',
        'max_uses' => 'integer',
        'max_uses_per_user' => 'integer',
        'current_uses' => 'integer',
        'valid_from' => 'datetime',
        'valid_until' => 'datetime',
        'applicable_categories' => 'array',
        'applicable_products' => 'array',
        'first_purchase_only' => 'boolean',
        'is_active' => 'boolean',
    ];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('valid_from')
                  ->orWhere('valid_from', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('valid_until')
                  ->orWhere('valid_until', '>=', now());
            });
    }

    public function scopeByCode($query, string $code)
    {
        return $query->where('code', strtoupper($code));
    }

    // Validation methods
    public function isValid(int $userId = null, float $cartTotal = 0, array $cartItems = []): array
    {
        $errors = [];

        // Check if active
        if (!$this->is_active) {
            $errors[] = 'El cupón no está activo.';
        }

        // Check validity dates
        if ($this->valid_from && now()->lt($this->valid_from)) {
            $errors[] = 'El cupón aún no es válido.';
        }

        if ($this->valid_until && now()->gt($this->valid_until)) {
            $errors[] = 'El cupón ha expirado.';
        }

        // Check total uses
        if ($this->max_uses && $this->current_uses >= $this->max_uses) {
            $errors[] = 'El cupón ha alcanzado su límite de usos.';
        }

        // Check uses per user
        if ($userId && $this->max_uses_per_user) {
            $userUses = $this->usages()->where('user_id', $userId)->count();
            if ($userUses >= $this->max_uses_per_user) {
                $errors[] = 'Ya has usado este cupón el máximo de veces permitido.';
            }
        }

        // Check minimum purchase
        if ($this->min_purchase && $cartTotal < $this->min_purchase) {
            $errors[] = sprintf(
                'Compra mínima requerida: $%s (actual: $%s)',
                number_format($this->min_purchase, 2),
                number_format($cartTotal, 2)
            );
        }

        // Check first purchase only
        if ($this->first_purchase_only && $userId) {
            $hasOrders = EcommerceOrder::where('user_id', $userId)
                ->where('status', '!=', 'cancelled')
                ->exists();
            
            if ($hasOrders) {
                $errors[] = 'Este cupón solo es válido para la primera compra.';
            }
        }

        // Check applicable categories/products
        if ($this->applicable_categories || $this->applicable_products) {
            $hasApplicableItems = false;
            
            foreach ($cartItems as $item) {
                $productId = $item['product_id'] ?? null;
                $categoryId = $item['category_id'] ?? null;
                
                if ($this->applicable_products && in_array($productId, $this->applicable_products)) {
                    $hasApplicableItems = true;
                    break;
                }
                
                if ($this->applicable_categories && in_array($categoryId, $this->applicable_categories)) {
                    $hasApplicableItems = true;
                    break;
                }
            }
            
            if (!$hasApplicableItems) {
                $errors[] = 'Este cupón no es aplicable a los productos en tu carrito.';
            }
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    public function calculateDiscount(float $subtotal): float
    {
        if ($this->type === 'free_shipping') {
            return 0; // Shipping discount handled separately
        }

        if ($this->type === 'fixed') {
            return min($this->discount_value, $subtotal);
        }

        // Percentage
        $discount = $subtotal * ($this->discount_value / 100);
        
        if ($this->max_discount) {
            $discount = min($discount, $this->max_discount);
        }

        return round($discount, 2);
    }

    public function incrementUsage(): void
    {
        $this->increment('current_uses');
    }
}
