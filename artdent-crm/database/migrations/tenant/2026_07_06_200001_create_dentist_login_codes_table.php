<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Códigos de acceso de un solo uso (4 dígitos) para el login del portal del
 * odontólogo por email, en vez de un link secreto permanente.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dentist_login_codes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dentist_id')->constrained('dentists')->cascadeOnDelete();
            $table->string('code', 4);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['dentist_id', 'code']);
        });

        Schema::table('dentists', function (Blueprint $table) {
            $table->string('remember_token', 100)->nullable()->after('portal_token');
        });
    }

    public function down(): void
    {
        Schema::table('dentists', function (Blueprint $table) {
            $table->dropColumn('remember_token');
        });

        Schema::dropIfExists('dentist_login_codes');
    }
};
