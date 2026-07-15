<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catálogo de fases: nombre + precio definidos una sola vez por empresa, para que las
 * fases que se repiten entre aranceles (ej. "Diseño", "Fresado") no haya que editarlas
 * arancel por arancel. `tariff_phases.phase_template_id` referencia esta tabla.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phase_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('name', 100);
            $table->decimal('price', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phase_templates');
    }
};
