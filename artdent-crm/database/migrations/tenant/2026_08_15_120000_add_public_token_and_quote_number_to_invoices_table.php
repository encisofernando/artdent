<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * public_token/quote_number están en database/schema/mysql-schema.sql
     * (schema squasheado) pero nunca tuvieron una migración CREATE propia —
     * mismo gap que Fase 0 (ver project_testing_infrastructure_fix). Los
     * tenants creados desde el schema squasheado ya las tienen; fer_artdent
     * (más viejo, originalmente CRM_MODE=owner) no. hasColumn hace esto
     * seguro de correr en ambos casos.
     */
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            if (! Schema::hasColumn('invoices', 'public_token')) {
                $table->string('public_token', 64)->nullable()->unique()->after('notes');
            }

            if (! Schema::hasColumn('invoices', 'quote_number')) {
                $table->string('quote_number', 50)->nullable()->after('public_token');
            }
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            if (Schema::hasColumn('invoices', 'quote_number')) {
                $table->dropColumn('quote_number');
            }

            if (Schema::hasColumn('invoices', 'public_token')) {
                $table->dropColumn('public_token');
            }
        });
    }
};
