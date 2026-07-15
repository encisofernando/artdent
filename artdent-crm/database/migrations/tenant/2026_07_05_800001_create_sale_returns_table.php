<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies');
            $table->foreignId('sale_id')->constrained('sales');
            $table->foreignId('user_id')->constrained('users');
            $table->string('reason')->nullable();
            $table->enum('refund_method', ['cash', 'store_credit', 'none'])->default('none');
            $table->decimal('total_refund', 14, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_returns');
    }
};
