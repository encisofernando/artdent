<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table): void {
            $table->string('slide_type', 20)->default('image')->after('click_url');
            $table->string('eyebrow', 120)->nullable()->after('slide_type');
            $table->string('title', 180)->nullable()->after('eyebrow');
            $table->string('subtitle', 220)->nullable()->after('title');
            $table->text('description')->nullable()->after('subtitle');
            $table->string('button_label', 80)->nullable()->after('description');
            $table->string('button_url', 255)->nullable()->after('button_label');
            $table->string('content_align', 20)->default('left')->after('button_url');
            $table->string('content_width', 20)->default('md')->after('content_align');
            $table->string('height_mode', 20)->default('regular')->after('content_width');
            $table->string('font_style', 20)->default('brand')->after('height_mode');
            $table->string('title_size', 20)->default('lg')->after('font_style');
            $table->string('body_size', 20)->default('md')->after('title_size');
            $table->string('overlay_strength', 20)->default('medium')->after('body_size');
            $table->string('surface_style', 20)->default('glass')->after('overlay_strength');
            $table->string('eyebrow_color', 20)->nullable()->after('surface_style');
            $table->string('title_color', 20)->nullable()->after('eyebrow_color');
            $table->string('subtitle_color', 20)->nullable()->after('title_color');
            $table->string('description_color', 20)->nullable()->after('subtitle_color');
            $table->string('button_bg_color', 20)->nullable()->after('description_color');
            $table->string('button_text_color', 20)->nullable()->after('button_bg_color');
            $table->string('button_border_color', 20)->nullable()->after('button_text_color');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table): void {
            $table->dropColumn([
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
            ]);
        });
    }
};
