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
            $table->string('guest_email')->nullable()->after('customer_id');
            $table->string('guest_dni', 30)->nullable()->after('guest_email');
        });
    }

    public function down(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            $table->dropColumn(['guest_email', 'guest_dni']);
        });
    }
};
