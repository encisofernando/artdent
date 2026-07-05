<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_enrollments', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('training_session_id');
            $table->unsignedBigInteger('employee_id');
            $table->enum('status', ['enrolled', 'completed', 'failed', 'cancelled'])->default('enrolled');
            $table->decimal('score', 5, 2)->nullable();
            $table->string('certificate_path')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('training_session_id')->references('id')->on('training_sessions')->cascadeOnDelete();
            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->unique(['training_session_id', 'employee_id'], 'uq_training_enrollment');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_enrollments');
    }
};
