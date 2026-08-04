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
            $table->string('andreani_branch_code', 30)->nullable()->after('moto_company_id')
                ->comment('Código de sucursal Andreani cuando shipping_method_type=andreani_branch, usado al armar el envío real (destination.code_branch)');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ecommerce_orders', function (Blueprint $table): void {
            $table->dropColumn('andreani_branch_code');
        });
    }
};
