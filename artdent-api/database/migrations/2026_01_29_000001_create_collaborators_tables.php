<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaborators', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('name');
            $table->string('document')->nullable();
            $table->decimal('hourly_rate', 12, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('collaborator_attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->foreignId('collaborator_id')->constrained('collaborators')->cascadeOnDelete();
            $table->date('work_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->decimal('hours', 8, 2)->default(0);
            $table->decimal('amount', 12, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();

            // Nombre corto por compatibilidad con MySQL (límite 64 chars)
            $table->index(['collaborator_id', 'work_date'], 'ca_collab_workdate_idx');
        });

        Schema::create('collaborator_extras', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->foreignId('collaborator_id')->constrained('collaborators')->cascadeOnDelete();
            $table->date('date');
            $table->string('concept');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();

            // Nombre corto por compatibilidad con MySQL (límite 64 chars)
            $table->index(['collaborator_id', 'date'], 'ce_collab_date_idx');
        });

        Schema::create('collaborator_discounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->foreignId('collaborator_id')->constrained('collaborators')->cascadeOnDelete();
            $table->date('date');
            $table->string('concept');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();

            // Nombre corto por compatibilidad con MySQL (límite 64 chars)
            $table->index(['collaborator_id', 'date'], 'cd_collab_date_idx');
        });

        Schema::create('collaborator_receipts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->foreignId('collaborator_id')->constrained('collaborators')->cascadeOnDelete();
            $table->date('period_from');
            $table->date('period_to');
            $table->decimal('hours', 8, 2)->default(0);
            $table->decimal('gross', 12, 2)->default(0);
            $table->decimal('extras_total', 12, 2)->default(0);
            $table->decimal('discounts_total', 12, 2)->default(0);
            $table->decimal('net', 12, 2)->default(0);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            // Nombre corto por compatibilidad con MySQL (límite 64 chars)
            $table->index(['collaborator_id', 'period_from', 'period_to'], 'cr_collab_period_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaborator_receipts');
        Schema::dropIfExists('collaborator_discounts');
        Schema::dropIfExists('collaborator_extras');
        Schema::dropIfExists('collaborator_attendances');
        Schema::dropIfExists('collaborators');
    }
};
