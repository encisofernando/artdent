<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
