<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_concepts', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('code', 60);
            $table->string('name', 191);
            $table->enum('type', ['remunerative', 'non_remunerative', 'deduction', 'contribution', 'employer_contribution'])->default('remunerative');
            $table->enum('calculation_type', ['fixed', 'percentage', 'formula'])->default('formula');
            $table->boolean('affects_sac')->default(false);
            $table->boolean('affects_vacation')->default(false);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('order')->default(0);
            $table->softDeletes();
            $table->timestamps();

            $table->index(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_concepts');
    }
};
