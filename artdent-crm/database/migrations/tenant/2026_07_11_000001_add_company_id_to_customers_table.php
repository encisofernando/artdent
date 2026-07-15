<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega company_id a customers para cerrar la fuga de aislamiento entre
     * companies de un mismo tenant (CustomerController no filtraba por company).
     * Se agrega nullable, se backfillea y recién después se fuerza NOT NULL
     * para no romper filas existentes durante el deploy.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->unsignedBigInteger('company_id')->nullable()->after('id');
            $table->index('company_id', 'idx_customers_company');
        });

        // Backfill: customers huérfanos van a la company id 1 (coherente con
        // el default del selector de compañía activa — ver App\Support\CompanyContext).
        DB::table('customers')->whereNull('company_id')->update(['company_id' => 1]);

        DB::statement('ALTER TABLE customers MODIFY company_id BIGINT UNSIGNED NOT NULL');

        Schema::table('customers', function (Blueprint $table): void {
            $table->foreign('company_id', 'fk_customers_company')
                ->references('id')->on('companies')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->dropForeign('fk_customers_company');
            $table->dropIndex('idx_customers_company');
            $table->dropColumn('company_id');
        });
    }
};
