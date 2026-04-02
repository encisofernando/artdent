<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = [
        'image_url',
        'click_url',
        'slide_type',
        'eyebrow',
        'title',
        'subtitle',
        'description',
        'button_label',
        'button_url',
        'content_align',
        'content_width',
        'height_mode',
        'font_style',
        'title_size',
        'body_size',
        'overlay_strength',
        'surface_style',
        'eyebrow_color',
        'title_color',
        'subtitle_color',
        'description_color',
        'button_bg_color',
        'button_text_color',
        'button_border_color',
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
