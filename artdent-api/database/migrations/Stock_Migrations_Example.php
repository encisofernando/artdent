<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Migración: crear tabla stock
 * Archivo: YYYY_MM_DD_HHMMSS_create_stock_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->integer('quantity')->default(0);
            $table->timestamps();

            // Índices
            $table->unique(['product_id', 'warehouse_id']);
            $table->index('product_id');
            $table->index('warehouse_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock');
    }
};

/**
 * Migración: crear tabla stock_movements
 * Archivo: YYYY_MM_DD_HHMMSS_create_stock_movements_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out']); // entrada o salida
            $table->integer('quantity');
            $table->string('reason')->nullable(); // 'Venta', 'Compra', 'Ajuste manual', etc.
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->timestamp('date');
            
            // Referencia opcional a la transacción que generó el movimiento
            $table->string('reference_type')->nullable(); // 'sale', 'purchase', 'adjustment'
            $table->unsignedBigInteger('reference_id')->nullable();
            
            $table->timestamps();

            // Índices
            $table->index('product_id');
            $table->index('warehouse_id');
            $table->index('date');
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};

/**
 * Migración: agregar columna is_default a warehouses
 * Archivo: YYYY_MM_DD_HHMMSS_add_is_default_to_warehouses_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->boolean('is_default')->default(false)->after('name');
            $table->index('is_default');
        });

        // Marcar el primer warehouse de cada empresa como default
        DB::statement('
            UPDATE warehouses w1
            SET is_default = true
            WHERE id IN (
                SELECT MIN(id)
                FROM warehouses w2
                WHERE w2.company_id = w1.company_id
                GROUP BY company_id
            )
        ');
    }

    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropColumn('is_default');
        });
    }
};
