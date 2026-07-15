<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('job_types')) {
            Schema::create('job_types', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->string('name', 191);
                $table->string('color', 7)->default('#6366f1');
                $table->boolean('is_active')->default(true);
                $table->timestamp('created_at')->nullable();

                $table->index('company_id', 'fk_jt_company');
            });
        }

        if (! Schema::hasTable('jobs')) {
            Schema::create('jobs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('company_id')->constrained()->cascadeOnDelete();
                $table->foreignId('dentist_id')->constrained()->cascadeOnDelete();
                $table->foreignId('patient_id')->nullable()->constrained()->nullOnDelete();
                $table->foreignId('job_type_id')->nullable()->constrained('job_types')->nullOnDelete();
                $table->unsignedBigInteger('assigned_user_id')->nullable()->comment('Técnico asignado');
                $table->string('job_number', 50);
                $table->enum('status', ['received', 'in_progress', 'quality_check', 'ready', 'delivered', 'cancelled'])->default('received');
                $table->enum('priority', ['normal', 'urgent', 'rush'])->default('normal');
                $table->text('description')->nullable();
                $table->text('clinical_notes')->nullable()->comment('Indicaciones clínicas del odontólogo');
                $table->string('shade', 30)->nullable()->comment('Color dental: A1, A2, B3, etc.');
                $table->string('color_system', 30)->nullable()->comment('Sistema de color: Vita, Chromascop, Ivoclar, etc.');
                $table->string('sector', 100)->nullable()->comment('Sector del lab: cerámica, prótesis, ortodoncia, etc.');
                $table->date('received_at')->nullable();
                $table->date('due_date')->nullable()->comment('Fecha de entrega comprometida');
                $table->dateTime('delivered_at')->nullable();
                $table->decimal('subtotal', 12, 2)->default(0);
                $table->decimal('discount_amount', 12, 2)->default(0);
                $table->decimal('urgency_fee', 12, 2)->default(0)->comment('Recargo por urgencia aplicado');
                $table->enum('delivery_method', ['retiro_dentista', 'reparto', 'courier', 'retiro_paciente'])
                    ->default('retiro_dentista')
                    ->comment('Forma de entrega');
                $table->date('pickup_date')->nullable()->comment('Fecha pactada de retiro/entrega al odontólogo');
                $table->foreignId('remake_of_job_id')->nullable()->constrained('jobs')->nullOnDelete();
                $table->string('remake_reason')->nullable()->comment('Motivo del rehecho');
                $table->text('lab_technician_notes')->nullable()->comment('Observaciones internas del técnico');
                $table->unsignedTinyInteger('estimated_days')->nullable()->comment('Días estimados de producción');
                $table->decimal('total', 12, 2)->default(0);
                $table->boolean('billed')->default(false)->comment('Si ya fue incluido en factura');
                $table->unsignedBigInteger('invoice_id')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->softDeletes();

                $table->unique(['company_id', 'job_number'], 'uq_job_number');
                $table->index('dentist_id', 'idx_jobs_dentist');
                $table->index('patient_id', 'idx_jobs_patient');
                $table->index('status', 'idx_jobs_status');
                $table->index('due_date', 'idx_jobs_due');
                $table->index('assigned_user_id', 'fk_jobs_user');
                $table->index('sector', 'idx_jobs_sector');
                $table->index('pickup_date', 'idx_jobs_pickup_date');
            });
        }

        if (! Schema::hasTable('job_items')) {
            Schema::create('job_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
                $table->foreignId('tariff_id')->nullable()->constrained('tariffs')->nullOnDelete();
                $table->string('description');
                $table->decimal('quantity', 8, 3)->default(1);
                $table->decimal('unit_price', 12, 2);
                $table->decimal('discount', 12, 2)->default(0);
                $table->decimal('total', 12, 2);

                $table->index('job_id', 'idx_ji_job');
            });
        }

        if (! Schema::hasTable('job_teeth')) {
            Schema::create('job_teeth', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
                $table->string('tooth', 10)->comment('Número FDI: 11, 12, 21... o 11-16 para rango');
                $table->string('note', 191)->nullable();

                $table->index('job_id', 'idx_jt_job');
            });
        }

        if (! Schema::hasTable('job_attachments')) {
            Schema::create('job_attachments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('filename');
                $table->string('url', 500);
                $table->string('mime_type', 100)->nullable();
                $table->unsignedInteger('size_bytes')->nullable();
                $table->string('note')->nullable();
                $table->timestamp('created_at')->nullable();

                $table->index('job_id', 'idx_ja_job');
            });
        }

        if (! Schema::hasTable('job_collaborators')) {
            Schema::create('job_collaborators', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
                $table->foreignId('collaborator_id')->constrained('collaborators')->cascadeOnDelete();
                $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete()->comment('Usuario que asignó');
                $table->string('role', 100)->nullable()->comment('Rol en este trabajo: ceramista, montaje, etc.');
                $table->dateTime('assigned_at')->nullable();
                $table->dateTime('completed_at')->nullable()->comment('Cuando terminó su parte');
                $table->string('notes')->nullable();
                $table->timestamps();

                $table->unique(['job_id', 'collaborator_id'], 'uq_job_collaborator');
                $table->index('collaborator_id', 'idx_jc_collaborator');
                $table->index('job_id', 'idx_jc_job');
            });
        }

        if (! Schema::hasTable('job_remakes')) {
            Schema::create('job_remakes', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete()->comment('Trabajo nuevo (el rehecho)');
                $table->foreignId('original_job_id')->constrained('jobs')->cascadeOnDelete()->comment('Trabajo original que se rehízo');
                $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete()->comment('Usuario que reportó el rehecho');
                $table->enum('responsibility', ['lab', 'dentist', 'patient', 'material', 'unknown'])
                    ->default('unknown')
                    ->comment('A quién se atribuye el error');
                $table->string('reason_category', 100)->nullable()->comment('Color, ajuste, fractura, diseño, etc.');
                $table->text('description')->nullable()->comment('Descripción detallada del problema');
                $table->decimal('material_cost', 12, 2)->default(0)->comment('Costo de materiales del rehecho');
                $table->decimal('labor_cost', 12, 2)->default(0)->comment('Costo de mano de obra del rehecho');
                $table->enum('charged_to', ['lab', 'dentist', 'insurance'])
                    ->default('lab')
                    ->comment('Quién absorbe el costo');
                $table->timestamp('created_at')->nullable();

                $table->index('job_id', 'idx_jr_job');
                $table->index('original_job_id', 'idx_jr_original');
                $table->index('reported_by', 'idx_jr_reported_by');
            });
        }

        if (! Schema::hasTable('job_status_history')) {
            Schema::create('job_status_history', function (Blueprint $table) {
                $table->id();
                $table->foreignId('job_id')->constrained('jobs')->cascadeOnDelete();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->string('status', 64);
                $table->text('note')->nullable();
                $table->timestamp('created_at')->nullable();

                $table->index('job_id', 'idx_jsh_job');
            });
        }
    }

    public function down(): void
    {
        // No destructivo: en producción estas tablas ya existen y esta migración actúa como compatibilidad local.
    }
};
