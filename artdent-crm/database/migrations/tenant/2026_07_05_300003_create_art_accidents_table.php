<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('art_accidents', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('employee_id');
            $table->dateTime('occurred_at');
            $table->text('description');
            $table->string('art_case_number', 100)->nullable();
            $table->enum('status', ['reported', 'in_treatment', 'closed'])->default('reported');
            $table->unsignedSmallInteger('days_lost')->default(0);
            $table->string('file_path')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->index(['company_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('art_accidents');
    }
};
