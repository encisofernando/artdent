<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Fila única (singleton, mismo patrón que afip_issuer_settings): credenciales
     * con las que ArtCode cobra la suscripción SaaS de sus tenants — separadas de
     * cualquier credencial de pago que cada tenant configure para SU propio
     * negocio dentro de artdent-crm.
     */
    public function up(): void
    {
        Schema::create('payment_credential_settings', function (Blueprint $table) {
            $table->id();

            $table->string('mp_public_key')->nullable();
            $table->text('mp_access_token')->nullable();

            $table->string('nave_client_id')->nullable();
            $table->text('nave_client_secret')->nullable();
            $table->string('nave_pos_id')->nullable();
            $table->boolean('nave_sandbox_mode')->default(true);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_credential_settings');
    }
};
