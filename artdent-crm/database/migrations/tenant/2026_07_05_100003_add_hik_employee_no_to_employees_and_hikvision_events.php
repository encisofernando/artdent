<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->string('hik_employee_no', 32)->nullable()->after('bank_name');
        });

        Schema::table('hikvision_events', function (Blueprint $table): void {
            $table->unsignedBigInteger('employee_id')->nullable()->after('collaborator_id');
            $table->foreign('employee_id')->references('id')->on('employees')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('hikvision_events', function (Blueprint $table): void {
            $table->dropForeign(['employee_id']);
            $table->dropColumn('employee_id');
        });

        Schema::table('employees', function (Blueprint $table): void {
            $table->dropColumn('hik_employee_no');
        });
    }
};
