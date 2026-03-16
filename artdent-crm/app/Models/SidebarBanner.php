<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SidebarBanner extends Model
{
    protected $fillable = [
        'title',
        'subtitle',
        'cta_label',
        'cta_url',
        'image_url',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
