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
        Schema::create('nave_charge_intents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('payable_type', 20); // 'sale' | 'customer_account'
            $table->unsignedBigInteger('payable_id'); // Sale.id o Customer.id según payable_type
            $table->string('nave_payment_type', 20); // 'static_qr' | 'payment_link'
            $table->string('pos_id');
            $table->string('payment_request_id', 50)->nullable();
            $table->decimal('amount', 12, 2);
            $table->string('description')->nullable();
            $table->string('status', 20)->default('pending'); // pending|approved|rejected|cancelled|expired
            $table->string('nave_payment_id', 50)->nullable();
            $table->string('webhook_secret', 64); // valida que el POST al webhook venga de este intent puntual
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['payable_type', 'payable_id']);
            $table->index('payment_request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nave_charge_intents');
    }
};
