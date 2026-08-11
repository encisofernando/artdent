<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Portal de odontólogos (panel.artdent.com.ar): permite iniciar sesión por
 * DNI además de email. El código de un solo uso sigue yendo siempre por
 * email — el DNI es sólo una forma alternativa de identificar la cuenta,
 * no un segundo factor.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dentists', function (Blueprint $table) {
            $table->string('dni', 20)->nullable()->unique()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('dentists', function (Blueprint $table) {
            $table->dropColumn('dni');
        });
    }
};
