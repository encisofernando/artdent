<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * patients.company_id está en database/schema/mysql-schema.sql pero sin
     * migración CREATE propia — mismo gap que Fase 0/Fase 5 (ver
     * project_testing_infrastructure_fix / project_tenant_resolution_fase5).
     * fer_artdent y artcode_pos no tienen la columna; artcode_pato y
     * artcode_sanjose sí (vacías, sin filas que backfillear). hasColumn()
     * la agrega donde falta; el UPDATE backfillea desde dentists.company_id
     * (la relación que PatientController ya usa para el scoping manual)
     * donde haya quedado null.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('patients', 'company_id')) {
            Schema::table('patients', function (Blueprint $table): void {
                $table->unsignedBigInteger('company_id')->nullable()->after('id');
            });
        }

        DB::statement('
            UPDATE patients p
            INNER JOIN dentists d ON d.id = p.dentist_id
            SET p.company_id = d.company_id
            WHERE p.company_id IS NULL
        ');
    }

    public function down(): void
    {
        if (Schema::hasColumn('patients', 'company_id')) {
            Schema::table('patients', function (Blueprint $table): void {
                $table->dropColumn('company_id');
            });
        }
    }
};
