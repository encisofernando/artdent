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
            $table->string('shipping_method_type', 30)->nullable()->after('shipping_method_id')
                ->comment('home_delivery|pickup_point|moto');
            $table->unsignedBigInteger('pickup_point_id')->nullable()->after('shipping_method_type');
            $table->unsignedBigInteger('moto_company_id')->nullable()->after('pickup_point_id');

            $table->foreign('pickup_point_id')->references('id')->on('shipping_pickup_points')->nullOnDelete();
            $table->foreign('moto_company_id')->references('id')->on('shipping_moto_companies')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            $table->dropForeign(['pickup_point_id']);
            $table->dropForeign(['moto_company_id']);
            $table->dropColumn(['shipping_method_type', 'pickup_point_id', 'moto_company_id']);
        });
    }
};
