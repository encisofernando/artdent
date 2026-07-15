<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * Bug real encontrado probando la notificación de fichaje HikVision: el terminal puede
 * reportar `currentVerifyMode` como fingerprint/card/pin (HikVisionWebhookController::
 * VERIFY_MODE_MAP los mapea tal cual), pero el enum `method` de ambas tablas de asistencia
 * solo aceptaba biometric|manual|system|webauthn — cualquier fichaje por huella/tarjeta/PIN
 * en el terminal real fallaba al guardar (truncation error), no solo en esta sesión de prueba.
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE employee_attendances MODIFY COLUMN method ENUM('biometric','manual','system','webauthn','fingerprint','card','pin') NOT NULL DEFAULT 'manual'");
        DB::statement("ALTER TABLE collaborator_attendances MODIFY COLUMN method ENUM('biometric','manual','system','webauthn','fingerprint','card','pin') NULL DEFAULT 'manual'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE employee_attendances MODIFY COLUMN method ENUM('biometric','manual','system','webauthn') NOT NULL DEFAULT 'manual'");
        DB::statement("ALTER TABLE collaborator_attendances MODIFY COLUMN method ENUM('biometric','manual','system','webauthn') NULL DEFAULT 'manual'");
    }
};
