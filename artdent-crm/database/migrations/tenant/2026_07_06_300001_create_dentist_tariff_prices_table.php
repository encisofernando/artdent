<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tabla nunca migrada: el modelo `DentistTariffPrice` y su controller ya existían y se
 * usan desde `DentistController::edit()` ("Sync Custom Prices" / precio personalizado
 * por odontólogo), pero la tabla nunca se creó, rompiendo la edición de cualquier
 * odontólogo con un `SQLSTATE[42S02]: Base table or view not found`.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('dentist_tariff_prices')) {
            return;
        }

        Schema::create('dentist_tariff_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dentist_id')->constrained('dentists')->cascadeOnDelete();
            $table->foreignId('tariff_id')->constrained('tariffs')->cascadeOnDelete();
            $table->decimal('price', 14, 2);
            $table->timestamps();

            $table->unique(['dentist_id', 'tariff_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dentist_tariff_prices');
    }
};
