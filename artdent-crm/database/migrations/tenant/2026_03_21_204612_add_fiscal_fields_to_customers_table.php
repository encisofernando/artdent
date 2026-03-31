<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('cuit', 20)->nullable()->after('dni');
            $table->enum('iva_condition', [
                'consumidor_final',
                'responsable_inscripto',
                'monotributista',
                'exento',
            ])->default('consumidor_final')->after('cuit');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['cuit', 'iva_condition']);
        });
    }
};
