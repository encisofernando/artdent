<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Placeholder de arquitectura para una futura integración con el Libro de Sueldos
     * Digital / SICOSS. NO hay ninguna llamada real implementada todavía — la especificación
     * técnico-legal exacta (endpoint, esquema, período de vigencia) debe confirmarse con el
     * usuario/contador antes de activar cualquier envío real. Ver `LibroSueldosDigitalService`.
     */
    public function up(): void
    {
        Schema::create('payroll_book_submissions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('payroll_run_id')->nullable();
            $table->string('period', 7)->comment('Formato YYYY-MM');
            $table->enum('status', ['pending', 'not_implemented', 'submitted', 'error'])->default('not_implemented');
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->foreign('payroll_run_id')->references('id')->on('payroll_runs')->nullOnDelete();
            $table->index(['company_id', 'period']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_book_submissions');
    }
};
