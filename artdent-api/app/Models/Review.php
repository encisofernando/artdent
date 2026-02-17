<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'product_id',
        'user_id',
        'order_id',
        'customer_name',
        'customer_email',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'is_approved',
        'images',
        'helpful_count',
        'not_helpful_count',
        'vendor_response',
        'vendor_response_at',
    ];

    protected $casts = [
        'images' => 'array',
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
        'is_approved' => 'boolean',
        'helpful_count' => 'integer',
        'not_helpful_count' => 'integer',
        'vendor_response_at' => 'datetime',
    ];

    protected $appends = ['customer_display_name'];

    // Relationships
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(EcommerceOrder::class, 'order_id');
    }

    // Accessors
    public function getCustomerDisplayNameAttribute(): string
    {
        if ($this->user) {
            return $this->user->name;
        }
        
        if ($this->customer_name) {
            // Hide part of the name for privacy
            $parts = explode(' ', $this->customer_name);
            if (count($parts) > 1) {
                return $parts[0] . ' ' . substr($parts[1], 0, 1) . '.';
            }
            return substr($this->customer_name, 0, 1) . str_repeat('*', strlen($this->customer_name) - 1);
        }
        
        return 'Comprador verificado';
    }

    // Scopes
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified_purchase', true);
    }

    public function scopeByRating($query, int $rating)
    {
        return $query->where('rating', $rating);
    }

    public function scopeForProduct($query, int $productId)
    {
        return $query->where('product_id', $productId);
    }

    // Methods
    public function markAsHelpful(int $userId = null, string $sessionId = null): void
    {
        $vote = ReviewHelpfulVote::updateOrCreate(
            [
                'review_id' => $this->id,
                'user_id' => $userId,
                'session_id' => $sessionId,
            ],
            ['is_helpful' => true]
        );

        $this->recalculateHelpfulCounts();
    }

    public function markAsNotHelpful(int $userId = null, string $sessionId = null): void
    {
        $vote = ReviewHelpfulVote::updateOrCreate(
            [
                'review_id' => $this->id,
                'user_id' => $userId,
                'session_id' => $sessionId,
            ],
            ['is_helpful' => false]
        );

        $this->recalculateHelpfulCounts();
    }

    protected function recalculateHelpfulCounts(): void
    {
        $this->helpful_count = ReviewHelpfulVote::where('review_id', $this->id)
            ->where('is_helpful', true)
            ->count();
            
        $this->not_helpful_count = ReviewHelpfulVote::where('review_id', $this->id)
            ->where('is_helpful', false)
            ->count();
            
        $this->save();
    }
}
