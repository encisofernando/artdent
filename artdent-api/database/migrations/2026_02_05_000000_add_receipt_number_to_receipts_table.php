<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            // Guardamos el número correlativo del comprobante.
            // 20 alcanza para formatos tipo 0001-00000023
            if (!Schema::hasColumn('receipts', 'receipt_number')) {
                $table->string('receipt_number', 20)->nullable()->after('id');
            }
        });

        // Backfill de recibos existentes (si hay), usando el ID como correlativo.
        // Formato: 0001-00000042
        DB::statement("UPDATE receipts SET receipt_number = CONCAT('0001-', LPAD(id, 8, '0')) WHERE receipt_number IS NULL");

        // Índice único para evitar duplicados.
        Schema::table('receipts', function (Blueprint $table) {
            // Laravel no ofrece un 'if not exists' para índices; capturamos excepciones.
            try {
                $table->unique('receipt_number', 'receipts_receipt_number_unique');
            } catch (\Throwable $e) {
                // Si ya existe, no hacemos nada.
            }
        });
    }

    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            try { $table->dropUnique('receipts_receipt_number_unique'); } catch (\Throwable $e) {}
            if (Schema::hasColumn('receipts', 'receipt_number')) {
                $table->dropColumn('receipt_number');
            }
        });
    }
};
