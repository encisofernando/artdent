<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();            // starter, pro, enterprise
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);             // Precio mensual en ARS
            $table->integer('trial_days')->default(14);
            $table->boolean('is_active')->default(true);

            // MercadoPago Preapproval Plan
            $table->string('mp_plan_id')->nullable();    // ID del plan en MP
            $table->string('mp_init_point')->nullable(); // URL de checkout

            // Límites del plan
            $table->integer('max_users')->nullable();    // null = ilimitado
            $table->integer('max_products')->nullable();
            $table->integer('max_sales_per_month')->nullable();

            $table->json('features')->nullable();        // Array de features incluidas

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
