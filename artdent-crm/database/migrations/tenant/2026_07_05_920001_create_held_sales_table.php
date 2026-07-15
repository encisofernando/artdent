<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Ventas "en espera": un carrito de POS guardado sin confirmar, para atender a otro
 * cliente y retomarlo después. No es una venta real todavía (no descuenta stock, no
 * genera comprobante), por eso vive en su propia tabla y no en `sales`.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('held_sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('user_id')->constrained('users');
            $table->string('label')->nullable();
            $table->json('cart_data');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('held_sales');
    }
};
