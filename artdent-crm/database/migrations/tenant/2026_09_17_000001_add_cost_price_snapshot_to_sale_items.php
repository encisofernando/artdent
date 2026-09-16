<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            // Costo unitario del producto al momento de realizar la venta.
            // Nullable para compatibilidad retroactiva con registros existentes.
            // A partir de esta migración, el SaleController lo poblará en cada venta nueva.
            $table->decimal('cost_price_snapshot', 14, 2)->nullable()->after('unit_price');
        });

        // Backfill: para registros históricos sin snapshot, usamos el costo actual del producto
        // como mejor aproximación disponible. No es exacto pero es útil para análisis histórico.
        DB::statement('
            UPDATE sale_items si
            INNER JOIN products p ON p.id = si.product_id
            SET si.cost_price_snapshot = COALESCE(p.cost_price, 0)
            WHERE si.cost_price_snapshot IS NULL
              AND si.product_id IS NOT NULL
        ');
    }

    public function down(): void
    {
        Schema::table('sale_items', function (Blueprint $table) {
            $table->dropColumn('cost_price_snapshot');
        });
    }
};
