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
        // Central a propósito, mismo criterio que kiosk_networks: el
        // isup-listener recibe conexiones de terminales físicos identificados
        // sólo por su Account ID, sin sesión/login — hace falta resolver "a
        // qué tenant pertenece este Account ID" ANTES de poder inicializar la
        // tenancy y consultar la BD de ese tenant (ver
        // App\Http\Middleware\RestrictToLabNetwork y KioskNetwork en
        // artdent-crm, mismo patrón). Sin FK a `tenants`: no hace falta que
        // sobreviva al borrado del tenant, pero tampoco hace falta que lo
        // bloquee.
        Schema::create('isup_device_registry', function (Blueprint $table) {
            $table->id();
            $table->string('account_id')->unique();
            $table->string('tenant_id');
            $table->unsignedBigInteger('device_id')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('isup_device_registry');
    }
};
