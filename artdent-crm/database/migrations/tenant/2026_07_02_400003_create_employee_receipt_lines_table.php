<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_receipt_lines', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('employee_receipt_id');
            $table->unsignedBigInteger('payroll_concept_id')->nullable();
            $table->string('label', 191);
            $table->enum('type', ['remunerative', 'non_remunerative', 'deduction', 'contribution', 'employer_contribution']);
            $table->decimal('amount', 12, 2);
            $table->text('formula_snapshot')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->foreign('employee_receipt_id')->references('id')->on('employee_receipts')->cascadeOnDelete();
            $table->foreign('payroll_concept_id')->references('id')->on('payroll_concepts')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_receipt_lines');
    }
};
