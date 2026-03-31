<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->string('invoice_type', 10)->nullable()->after('reference_no'); // FA, FB, FC, FE, etc.
            $table->string('invoice_number', 50)->nullable()->after('invoice_type');
            $table->date('due_date')->nullable()->after('purchased_at');
        });
    }

    public function down(): void
    {
        Schema::table('purchases', function (Blueprint $table) {
            $table->dropColumn(['invoice_type', 'invoice_number', 'due_date']);
        });
    }
};
