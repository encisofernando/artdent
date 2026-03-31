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
        Schema::create('shipping_moto_companies', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('zone')->nullable()->comment('Zona de cobertura');
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_moto_companies');
    }
};
