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
        if (Schema::hasTable('tenant_subscriptions')) {
            return;
        }

        Schema::create('tenant_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');                  // FK → tenants.id
            $table->foreignId('plan_id')->constrained();
            $table->string('mp_preapproval_id')->nullable()->unique(); // ID de suscripción en MP
            $table->string('mp_payer_email')->nullable();
            $table->enum('status', [
                'pending',     // Esperando que el usuario confirme
                'authorized',  // Activa — pagos procesándose
                'paused',      // Pausada por MP (ej: pago fallido)
                'cancelled',   // Cancelada
            ])->default('pending');
            $table->timestamp('next_payment_date')->nullable();
            $table->timestamp('last_payment_date')->nullable();
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('ARS');
            $table->json('mp_data')->nullable();           // Respuesta completa de MP
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenant_subscriptions');
    }
};
