<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->string('tenant_name')->nullable();
            $table->string('subject');
            $table->enum('category', ['pregunta', 'tecnico', 'facturacion', 'otro'])->default('pregunta');
            $table->enum('priority', ['baja', 'media', 'alta'])->default('media');
            $table->enum('status', ['abierto', 'en_progreso', 'resuelto', 'cerrado'])->default('abierto');
            $table->string('created_by_name')->nullable();
            $table->string('created_by_email');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['status', 'priority']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
