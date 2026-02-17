<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('ecommerce_orders')->cascadeOnDelete();
            
            // Payment gateway
            $table->enum('gateway', ['mercadopago', 'stripe', 'manual', 'transfer'])->default('mercadopago');
            
            // Transaction details
            $table->string('transaction_id')->unique()->nullable(); // MP payment_id, Stripe charge_id
            $table->string('preference_id')->nullable(); // MP preference_id
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('ARS');
            
            // Status
            $table->enum('status', [
                'pending',
                'approved',
                'authorized',
                'in_process',
                'in_mediation',
                'rejected',
                'cancelled',
                'refunded',
                'charged_back'
            ])->default('pending');
            
            $table->string('status_detail')->nullable();
            
            // Payment method
            $table->string('payment_method_id')->nullable(); // credit_card, debit_card, etc
            $table->string('payment_type_id')->nullable(); // credit_card, debit_card, ticket, etc
            
            // Payer info
            $table->string('payer_email')->nullable();
            $table->json('payer_data')->nullable();
            
            // Additional data
            $table->json('metadata')->nullable();
            $table->text('error_message')->nullable();
            
            // Webhook
            $table->timestamp('webhook_received_at')->nullable();
            $table->json('webhook_data')->nullable();
            
            $table->timestamps();
            
            // Indexes
            $table->index(['order_id', 'status']);
            $table->index('transaction_id');
            $table->index('gateway');
        });

        // Add payment fields to orders table
        if (!Schema::hasColumn('ecommerce_orders', 'payment_method')) {
            Schema::table('ecommerce_orders', function (Blueprint $table) {
                $table->enum('payment_method', ['mercadopago', 'stripe', 'manual', 'transfer'])->nullable()->after('total');
                $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->after('payment_method');
                $table->timestamp('paid_at')->nullable()->after('payment_status');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        
        if (Schema::hasColumn('ecommerce_orders', 'payment_method')) {
            Schema::table('ecommerce_orders', function (Blueprint $table) {
                $table->dropColumn(['payment_method', 'payment_status', 'paid_at']);
            });
        }
    }
};
