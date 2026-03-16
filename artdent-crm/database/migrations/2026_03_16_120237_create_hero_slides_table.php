<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_slides', function (Blueprint $table) {
            $table->id();
            $table->string('eyebrow')->nullable();
            $table->string('title');
            $table->text('subtitle')->nullable();
            $table->string('cta_label')->nullable();
            $table->string('cta_href')->nullable();
            $table->string('secondary_label')->nullable();
            $table->string('secondary_href')->nullable();
            $table->string('image_url')->nullable();
            $table->string('bg_color_from', 7)->nullable()->comment('Hex inicio del gradiente, ej: #124C69');
            $table->string('bg_color_to', 7)->nullable()->comment('Hex fin del gradiente, ej: #1a6b8a');
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_slides');
    }
};
