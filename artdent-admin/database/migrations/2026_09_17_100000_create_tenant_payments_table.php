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
        Schema::create('tenant_payments', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id'); // Identificador del tenant (slug)
            $table->unsignedBigInteger('tenant_subscription_id')->nullable();
            $table->unsignedBigInteger('plan_id')->nullable();
            $table->unsignedBigInteger('subscription_invoice_id')->nullable();
            $table->string('payment_method', 30); // transfer, qr, cash, mercadopago, other
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('ARS');
            $table->timestamp('paid_at')->nullable();
            $table->string('reference', 255)->nullable(); // N° transferencia, CBU/alias, id operación QR
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('approved'); // approved, pending, rejected
            $table->unsignedBigInteger('created_by_user_id')->nullable(); // Usuario superadmin
            $table->string('mp_payment_id', 100)->nullable();
            $table->date('period_starts_at')->nullable();
            $table->date('period_ends_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
            $table->index('payment_method');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_payments');
    }
};
