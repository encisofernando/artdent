<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable()->comment('Null = catálogo global, disponible para todas las empresas');
            $table->string('code', 20);
            $table->string('name');
            $table->enum('category', ['vacaciones', 'enfermedad', 'maternidad_paternidad', 'estudio', 'matrimonio', 'fallecimiento', 'otro'])->default('otro');
            $table->boolean('paid')->default(true);
            $table->boolean('requires_certificate')->default(false);
            $table->unsignedSmallInteger('max_days_per_year')->nullable()->comment('Null = sin tope fijo (ej. vacaciones, que se calcula por antigüedad)');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_types');
    }
};
