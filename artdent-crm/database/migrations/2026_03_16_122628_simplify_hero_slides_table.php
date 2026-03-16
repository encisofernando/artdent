<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->dropColumn([
                'eyebrow', 'title', 'subtitle',
                'cta_label', 'cta_href',
                'secondary_label', 'secondary_href',
                'bg_color_from', 'bg_color_to',
            ]);
            $table->string('click_url')->nullable()->after('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('hero_slides', function (Blueprint $table) {
            $table->dropColumn('click_url');
            $table->string('eyebrow')->nullable();
            $table->string('title')->default('');
            $table->text('subtitle')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_href')->nullable();
            $table->string('secondary_label')->nullable();
            $table->string('secondary_href')->nullable();
            $table->string('bg_color_from', 7)->nullable();
            $table->string('bg_color_to', 7)->nullable();
        });
    }
};
