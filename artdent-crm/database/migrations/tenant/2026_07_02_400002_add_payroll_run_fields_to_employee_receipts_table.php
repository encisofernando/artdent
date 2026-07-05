<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_receipts', function (Blueprint $table): void {
            $table->unsignedBigInteger('payroll_run_id')->nullable()->after('employee_id');
            $table->decimal('concepts_total', 12, 2)->default(0)->after('sales_total');
            $table->decimal('employer_contributions_total', 12, 2)->default(0)->after('concepts_total');
            $table->json('formula_snapshot')->nullable()->after('notes');

            $table->foreign('payroll_run_id')->references('id')->on('payroll_runs')->nullOnDelete();
            $table->unique(['employee_id', 'period_from', 'period_to'], 'employee_receipts_period_unique');
        });
    }

    public function down(): void
    {
        Schema::table('employee_receipts', function (Blueprint $table): void {
            $table->dropUnique('employee_receipts_period_unique');
            $table->dropForeign(['payroll_run_id']);
            $table->dropColumn(['payroll_run_id', 'concepts_total', 'employer_contributions_total', 'formula_snapshot']);
        });
    }
};
