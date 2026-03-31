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
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            // mercadopago | bank_transfer | qr | cash | null (not yet selected)
            $table->string('selected_payment_method', 30)->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            $table->dropColumn('selected_payment_method');
        });
    }
};
