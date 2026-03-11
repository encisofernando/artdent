<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE collaborator_attendances MODIFY COLUMN `method` ENUM('biometric','manual','system','webauthn') DEFAULT 'manual'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE collaborator_attendances MODIFY COLUMN `method` ENUM('biometric','manual','system') DEFAULT 'manual'");
    }
};
