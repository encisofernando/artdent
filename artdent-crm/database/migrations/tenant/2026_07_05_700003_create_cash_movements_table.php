<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ver nota en 2026_07_05_700001_create_cash_drawers_table.php: esquema existente
 * documentado como migración real, no-op si ya existe.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('cash_movements')) {
            return;
        }

        Schema::create('cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_session_id')->constrained('cash_sessions')->cascadeOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained('payment_methods')->nullOnDelete();
            $table->enum('type', ['in', 'out']);
            $table->decimal('amount', 14, 2);
            $table->string('concept')->nullable();
            $table->string('reference_type', 64)->nullable()->comment('sale, lab_payment, expense, manual');
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index(['reference_type', 'reference_id'], 'idx_cm_reference');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_movements');
    }
};
