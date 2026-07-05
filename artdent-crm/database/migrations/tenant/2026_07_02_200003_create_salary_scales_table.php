<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_scales', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('labor_agreement_category_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->decimal('base_amount', 12, 2);
            $table->date('effective_from');
            $table->date('effective_to')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('labor_agreement_category_id')->references('id')->on('labor_agreement_categories')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['labor_agreement_category_id', 'effective_from']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_scales');
    }
};
