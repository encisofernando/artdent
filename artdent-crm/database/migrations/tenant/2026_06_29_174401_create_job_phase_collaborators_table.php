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
        Schema::create('job_phase_collaborators', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_phase_progress_id')->constrained('job_phase_progress')->cascadeOnDelete();
            $table->foreignId('collaborator_id')->constrained()->cascadeOnDelete();
            $table->decimal('commission_share', 5, 4)->nullable()->comment('NULL = división igual entre colaboradores de la fase');
            $table->timestamps();

            $table->unique(['job_phase_progress_id', 'collaborator_id'], 'uq_phase_collaborator');
            $table->index('collaborator_id', 'idx_jpc_collaborator');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('job_phase_collaborators');
    }
};
