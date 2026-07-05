<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_criteria', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('evaluation_cycle_id');
            $table->string('name');
            $table->decimal('weight', 5, 2)->default(0)->comment('Peso porcentual del criterio dentro del ciclo (debería sumar 100 entre todos)');
            $table->timestamps();

            $table->foreign('evaluation_cycle_id')->references('id')->on('evaluation_cycles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_criteria');
    }
};
