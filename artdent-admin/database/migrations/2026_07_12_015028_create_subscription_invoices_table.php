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
        // Comprobantes AFIP que ArtCode emite a sus tenants por la suscripción
        // SaaS. Sin FK a `tenants`/`tenant_subscriptions` a propósito (mismo
        // criterio que `superadmin_audit_logs` de la Fase 8): son documentos
        // fiscales, deben sobrevivir aunque el tenant se borre después.
        Schema::create('subscription_invoices', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('tenant_subscription_id')->nullable();
            $table->string('mp_payment_id')->nullable()->unique();
            $table->string('receipt_type', 3); // FA, FB, FC...
            $table->unsignedSmallInteger('point_sale');
            $table->unsignedBigInteger('number')->nullable(); // provisional hasta el CAE
            $table->string('cae')->nullable();
            $table->date('cae_expiry')->nullable();
            $table->string('recipient_name');
            $table->string('recipient_cuit', 20)->nullable();
            $table->string('description');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('tax_amount', 12, 2)->default(0);
            $table->decimal('total', 12, 2);
            $table->enum('status', ['pending', 'authorized', 'failed'])->default('pending');
            $table->enum('environment', ['homo', 'prod']);
            $table->json('afip_request')->nullable();
            $table->json('afip_response')->nullable();
            $table->text('afip_observations')->nullable();
            $table->text('afip_error_msg')->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_invoices');
    }
};
