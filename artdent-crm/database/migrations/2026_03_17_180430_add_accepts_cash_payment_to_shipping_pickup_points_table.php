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
        Schema::table('shipping_pickup_points', function (Blueprint $table): void {
            $table->boolean('accepts_cash_payment')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('shipping_pickup_points', function (Blueprint $table): void {
            $table->dropColumn('accepts_cash_payment');
        });
    }
};
