<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Multi-punto de venta AFIP por empresa. Reemplaza el campo único
 * companies.afip_point_sale (que se mantiene por compatibilidad/legacy pero
 * deja de ser la fuente de verdad). Backfill: cada Company con
 * afip_point_sale seteado recibe un punto de venta is_default=true con ese
 * mismo número, para no perder la configuración de nadie al desplegar.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('afip_points_of_sale', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('branches')->nullOnDelete();
            $table->unsignedSmallInteger('point_sale');
            $table->string('label')->nullable();
            $table->boolean('is_default')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['company_id', 'point_sale']);
        });

        DB::table('companies')
            ->whereNotNull('afip_point_sale')
            ->select('id', 'afip_point_sale')
            ->orderBy('id')
            ->each(function ($company) {
                DB::table('afip_points_of_sale')->insert([
                    'company_id' => $company->id,
                    'branch_id' => null,
                    'point_sale' => $company->afip_point_sale,
                    'label' => 'Principal',
                    'is_default' => true,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('afip_points_of_sale');
    }
};
