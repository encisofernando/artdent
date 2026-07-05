<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_variables', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('code', 60);
            $table->string('name', 191);
            $table->enum('data_type', ['number', 'bool', 'date', 'string'])->default('number');
            $table->enum('source', ['manual', 'system'])->default('manual');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['company_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_variables');
    }
};
