<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_receipts', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('employee_id');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->date('period_from');
            $table->date('period_to');
            $table->decimal('salary_gross', 12, 2)->default(0);
            $table->decimal('commission_gross', 12, 2)->default(0);
            $table->decimal('gross', 12, 2)->default(0);
            $table->decimal('extras_total', 12, 2)->default(0);
            $table->decimal('discounts_total', 12, 2)->default(0);
            $table->decimal('net', 12, 2)->default(0);
            $table->decimal('sales_total', 12, 2)->default(0);
            $table->enum('status', ['draft', 'paid', 'cancelled'])->default('draft');
            $table->timestamp('paid_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_receipts');
    }
};
