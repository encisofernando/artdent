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
        // Revisando el HCNetSDK real (HCNetSDK.h + Developer Guide, ver
        // docs/hikvision-isup-arquitectura.md § 5): el callback de
        // NET_DVR_StartListen_V30 identifica al dispositivo que se conecta
        // vía NET_DVR_ALARMER (serial, IP, MAC) — no quedó confirmado si el
        // "Account ID" que se carga en el terminal (Configuración → Red →
        // Plataforma de acceso) viaja de vuelta en ese mismo struct sin
        // hardware real para probarlo. Se agregan serial/MAC como
        // identificadores alternativos, mismo criterio de fallback que ya
        // usa HikVisionWebhookController para ISAPI push (IP → MAC → serial).
        Schema::table('isup_device_registry', function (Blueprint $table) {
            $table->string('serial_no')->nullable()->after('account_id');
            $table->string('mac_address')->nullable()->after('serial_no');

            $table->index('serial_no');
            $table->index('mac_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('isup_device_registry', function (Blueprint $table) {
            $table->dropColumn(['serial_no', 'mac_address']);
        });
    }
};
