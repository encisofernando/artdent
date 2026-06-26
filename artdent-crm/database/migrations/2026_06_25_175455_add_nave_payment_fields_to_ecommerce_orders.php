<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            $table->string('nave_payment_request_id', 50)->nullable()->after('mp_payment_id');
            $table->string('nave_payment_id', 50)->nullable()->after('nave_payment_request_id');
        });
    }

    public function down(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            $table->dropColumn(['nave_payment_request_id', 'nave_payment_id']);
        });
    }
};
