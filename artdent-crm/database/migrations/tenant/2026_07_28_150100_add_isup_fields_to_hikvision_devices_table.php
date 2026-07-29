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
        Schema::table('hikvision_devices', function (Blueprint $table) {
            // Un dispositivo puede usar ISAPI (pull/push actuales) o registrarse
            // vía ISUP contra el isup-listener — no son excluyentes a nivel
            // protocolo (el terminal puede tener ambos módulos activos), pero
            // a nivel de esta fila se elige el transporte principal.
            $table->string('connection_type')->default('isapi')->after('device_model');
            $table->string('isup_account_id')->nullable()->unique()->after('webhook_secret');
            $table->string('isup_status')->default('never_connected')->after('isup_account_id');
            $table->timestamp('isup_last_connected_at')->nullable()->after('isup_status');
            $table->timestamp('isup_last_disconnected_at')->nullable()->after('isup_last_connected_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('hikvision_devices', function (Blueprint $table) {
            $table->dropColumn([
                'connection_type',
                'isup_account_id',
                'isup_status',
                'isup_last_connected_at',
                'isup_last_disconnected_at',
            ]);
        });
    }
};
