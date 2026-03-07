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
        Schema::create('tariff_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tariff_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('material'); // material, mano_obra, herramienta, logistica, otros
            $table->string('description');
            $table->string('supplier')->nullable();
            $table->string('unit')->nullable(); // un, gr, ml
            $table->decimal('unit_cost', 10, 2)->default(0);
            $table->decimal('quantity', 10, 3)->default(1);
            $table->decimal('margin_pct', 5, 2)->default(30); // 30 = 30%
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tariff_costs');
    }
};
