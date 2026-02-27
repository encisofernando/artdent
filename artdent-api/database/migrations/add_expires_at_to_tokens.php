<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Sanctum 3.x ya incluye expires_at en la tabla personal_access_tokens.
 * Esta migración es solo necesaria si usás Sanctum 2.x o si la columna
 * no existe en tu instalación actual.
 *
 * Verificar primero: SHOW COLUMNS FROM personal_access_tokens;
 * Si ya tiene expires_at, no correr esta migración.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            if (!Schema::hasColumn('personal_access_tokens', 'expires_at')) {
                $table->timestamp('expires_at')->nullable()->after('last_used_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table) {
            if (Schema::hasColumn('personal_access_tokens', 'expires_at')) {
                $table->dropColumn('expires_at');
            }
        });
    }
};
