<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PopularSearch extends Model
{
    protected $table = 'popular_searches';

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
