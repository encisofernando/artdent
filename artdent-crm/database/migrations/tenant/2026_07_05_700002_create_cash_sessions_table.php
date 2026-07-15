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
        if (Schema::hasTable('cash_sessions')) {
            return;
        }

        Schema::create('cash_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_drawer_id')->constrained('cash_drawers');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('opened_at');
            $table->dateTime('closed_at')->nullable();
            $table->decimal('opening_amount', 14, 2)->default(0);
            $table->decimal('closing_amount', 14, 2)->default(0);
            $table->enum('status', ['open', 'closed'])->default('open');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_sessions');
    }
};
