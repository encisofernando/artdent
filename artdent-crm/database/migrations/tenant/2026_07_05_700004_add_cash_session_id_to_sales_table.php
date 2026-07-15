<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ver nota en 2026_07_05_700001_create_cash_drawers_table.php: columna existente
 * documentada como migración real, no-op si ya existe.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sales', 'cash_session_id')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->foreignId('cash_session_id')->nullable()->after('id')
                ->constrained('cash_sessions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('sales', 'cash_session_id')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->dropConstrainedForeignId('cash_session_id');
        });
    }
};
