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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('mp_customer_id')->nullable()->after('activated_at');  // ID payer en MP
            $table->string('checkout_url')->nullable()->after('mp_customer_id');  // URL de pago activa
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['mp_customer_id', 'checkout_url']);
        });
    }
};
