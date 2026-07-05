<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_scores', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('evaluation_id');
            $table->unsignedBigInteger('evaluation_criterion_id');
            $table->decimal('score', 5, 2)->comment('Puntaje 0-10 para el criterio');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->foreign('evaluation_id')->references('id')->on('evaluations')->cascadeOnDelete();
            $table->foreign('evaluation_criterion_id')->references('id')->on('evaluation_criteria')->cascadeOnDelete();
            $table->unique(['evaluation_id', 'evaluation_criterion_id'], 'uq_evaluation_score_criterion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_scores');
    }
};
