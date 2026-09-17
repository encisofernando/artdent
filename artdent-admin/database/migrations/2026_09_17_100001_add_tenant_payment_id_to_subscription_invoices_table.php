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
        Schema::table('subscription_invoices', function (Blueprint $table) {
            $table->unsignedBigInteger('tenant_payment_id')->nullable()->after('tenant_subscription_id');
            $table->index('tenant_payment_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscription_invoices', function (Blueprint $table) {
            $table->dropIndex(['tenant_payment_id']);
            $table->dropColumn('tenant_payment_id');
        });
    }
};
