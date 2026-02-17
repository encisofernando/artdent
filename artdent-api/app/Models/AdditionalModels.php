<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// ========================================
// PRODUCT COMPARISON
// ========================================

class ProductComparison extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'product_id',
        'position',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

// ========================================
// SEARCH & ANALYTICS
// ========================================

class SearchHistory extends Model
{
    protected $table = 'search_history';
    
    protected $fillable = [
        'user_id',
        'session_id',
        'query',
        'results_count',
        'filters',
        'has_results',
    ];

    protected $casts = [
        'filters' => 'array',
        'has_results' => 'boolean',
    ];
}

class PopularSearch extends Model
{
    protected $fillable = [
        'query',
        'search_count',
        'click_count',
        'conversion_rate',
        'last_searched_at',
    ];

    protected $casts = [
        'search_count' => 'integer',
        'click_count' => 'integer',
        'conversion_rate' => 'decimal:2',
        'last_searched_at' => 'datetime',
    ];
}

class ProductAnalytics extends Model
{
    protected $table = 'product_analytics';
    
    protected $fillable = [
        'product_id',
        'user_id',
        'session_id',
        'event_type',
        'source',
        'search_query',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}

// ========================================
// NEWSLETTER & EMAIL
// ========================================

class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'company_id',
        'user_id',
        'email',
        'name',
        'is_active',
        'preferences',
        'unsubscribe_token',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'preferences' => 'array',
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];
}

class EmailCampaign extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'subject',
        'content',
        'status',
        'scheduled_at',
        'sent_at',
        'recipients_count',
        'opened_count',
        'clicked_count',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'sent_at' => 'datetime',
        'recipients_count' => 'integer',
        'opened_count' => 'integer',
        'clicked_count' => 'integer',
    ];
}

// ========================================
// PAYMENTS
// ========================================

class PaymentTransaction extends Model
{
    protected $fillable = [
        'company_id',
        'order_id',
        'gateway',
        'transaction_id',
        'preference_id',
        'amount',
        'currency',
        'status',
        'status_detail',
        'payment_method_id',
        'payment_type_id',
        'payer_email',
        'payer_data',
        'metadata',
        'error_message',
        'webhook_received_at',
        'webhook_data',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'payer_data' => 'array',
        'metadata' => 'array',
        'webhook_data' => 'array',
        'webhook_received_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(EcommerceOrder::class, 'order_id');
    }
}
