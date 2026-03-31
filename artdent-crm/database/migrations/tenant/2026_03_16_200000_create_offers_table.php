<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('type'); // discount_percent, discount_fixed, two_for_one, combo, installments
            $table->decimal('value', 8, 2)->nullable();
            $table->string('badge_text')->nullable();
            $table->string('badge_color')->default('red');
            $table->text('description')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('offer_products', function (Blueprint $table): void {
            $table->foreignId('offer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->primary(['offer_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('offer_products');
        Schema::dropIfExists('offers');
    }
};
