<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Portal de autogestión del odontólogo (ver estado de sus órdenes, cuenta corriente,
 * pedir un retiro), análogo al portal de clientes de e-commerce (`customers.portal_token`).
 * Se backfillean los odontólogos existentes para que tengan acceso inmediato, ya que
 * a diferencia de un cliente nuevo, estos ya existen y necesitan el link ya.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dentists', function (Blueprint $table) {
            $table->string('portal_token', 64)->nullable()->unique()->after('id');
        });

        DB::table('dentists')->whereNull('portal_token')->orderBy('id')->pluck('id')->each(function ($id) {
            DB::table('dentists')->where('id', $id)->update(['portal_token' => Str::random(48)]);
        });
    }

    public function down(): void
    {
        Schema::table('dentists', function (Blueprint $table) {
            $table->dropColumn('portal_token');
        });
    }
};
