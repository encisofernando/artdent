<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Esta tabla ya existía en la base de datos del tenant de desarrollo (creada fuera del
 * flujo de migraciones) pero nunca tuvo una migración real, así que ningún tenant nuevo
 * la recibía. Esta migración documenta el esquema exacto encontrado vía `SHOW CREATE
 * TABLE` y es un no-op en tenants donde ya existe.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cash_drawers')) {
            return;
        }

        Schema::create('cash_drawers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->string('name');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_drawers');
    }
};
