<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Margen de rentabilidad aplicado sobre la suma de fases del arancel para calcular su
 * precio final (price = sum(phases.price) * (1 + margin_pct / 100)). Solo se usa cuando
 * el arancel tiene fases asignadas; si no, el precio sigue siendo manual o por fórmula
 * de costos, como hasta ahora.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->decimal('margin_pct', 5, 2)->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('tariffs', function (Blueprint $table) {
            $table->dropColumn('margin_pct');
        });
    }
};
