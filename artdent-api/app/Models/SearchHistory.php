<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
        'results_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
