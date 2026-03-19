<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_account_moves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_account_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); // purchase, payment, credit_note, adjustment
            $table->decimal('amount', 12, 2); // siempre positivo, el tipo determina el signo
            $table->decimal('balance_after', 12, 2);
            $table->string('description')->nullable();
            $table->string('reference_type')->nullable(); // App\Models\Purchase, App\Models\VendorPayment
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->date('move_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_account_moves');
    }
};
