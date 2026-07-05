<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_concept_versions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('payroll_concept_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->text('formula');
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('payroll_concept_id')->references('id')->on('payroll_concepts')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['payroll_concept_id', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_concept_versions');
    }
};
