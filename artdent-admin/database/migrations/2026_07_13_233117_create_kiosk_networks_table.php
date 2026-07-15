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
        // Central a propósito: los terminales físicos (fichaje, kiosco de
        // producción) pegan sin sesión/login, así que hace falta poder
        // resolver "a qué tenant pertenece esta IP/token" ANTES de saber a
        // qué base de tenant conectarse — por eso no puede vivir en la BD
        // de cada tenant (ver App\Http\Middleware\RestrictToLabNetwork en
        // artdent-crm). Sin FK a `tenants` (mismo criterio que
        // superadmin_audit_logs de la Fase 8: no hace falta que sobreviva
        // al borrado del tenant, pero tampoco hace falta que lo bloquee).
        Schema::create('kiosk_networks', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('label');
            $table->string('ip_address')->nullable();
            $table->string('token')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('ip_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kiosk_networks');
    }
};
