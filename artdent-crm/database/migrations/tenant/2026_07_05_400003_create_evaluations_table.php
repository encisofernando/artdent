<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('evaluation_cycle_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('evaluator_id')->nullable()->comment('Empleado evaluador (autoevaluación si es el mismo que employee_id)');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->text('summary')->nullable();
            $table->timestamps();

            $table->foreign('evaluation_cycle_id')->references('id')->on('evaluation_cycles')->cascadeOnDelete();
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->foreign('evaluator_id')->references('id')->on('employees')->nullOnDelete();
            $table->unique(['evaluation_cycle_id', 'employee_id', 'evaluator_id'], 'uq_evaluation_cycle_employee_evaluator');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
