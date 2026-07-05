<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_attendances', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('employee_id');
            $table->date('work_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->decimal('hours', 6, 2)->default(0)->comment('Horas trabajadas (calculadas), sin monto asociado — Employee no usa tarifa horaria.');
            $table->enum('method', ['biometric', 'manual', 'system', 'webauthn'])->default('manual');
            $table->string('ip_address', 45)->nullable();
            $table->string('device_info')->nullable();
            $table->boolean('is_absent')->default(false)->comment('Ausencia justificada/injustificada');
            $table->string('absence_reason', 191)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('employee_id')->references('id')->on('employees')->cascadeOnDelete();
            $table->foreign('company_id')->references('id')->on('companies');
            $table->unique(['employee_id', 'work_date'], 'uq_employee_attendance_day');
            $table->index(['company_id', 'work_date'], 'idx_emp_att_company_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_attendances');
    }
};
