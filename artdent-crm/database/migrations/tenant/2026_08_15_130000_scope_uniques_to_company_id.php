<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * customers.email/dni/phone y products.slug eran UNIQUE globales dentro
     * del tenant — un tenant con más de una company (multi-empresa, ver
     * BelongsToCompany de la Fase 2) no podía tener el mismo cliente/slug en
     * dos companies distintas. Pasan a ser únicos por (company_id, columna).
     *
     * portal_token de customers queda IGUAL (único global): es un token
     * random no relacionado a la identidad real del cliente, y la ruta
     * pública /portal/{token} lo busca sin saber la company de antemano
     * (ver InitializeTenancyByPublicToken) — escoparlo por company no
     * resolvería nada real y complicaría esa resolución.
     *
     * Verificado antes de escribir esto: los 4 tenants reales de producción
     * (fer_artdent, artcode_pos, artcode_pato, artcode_sanjose) no tienen
     * NINGÚN duplicado hoy (imposible bajo el constraint viejo, que ya lo
     * prevenía) y los 4 tienen exactamente 1 company — o sea, este fix
     * "endurece para el futuro", no repara datos rotos hoy.
     */
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            if (Schema::hasIndex('customers', 'uq_customer_email')) {
                $table->dropUnique('uq_customer_email');
            }
            if (Schema::hasIndex('customers', 'customers_dni_unique')) {
                $table->dropUnique('customers_dni_unique');
            }
            if (Schema::hasIndex('customers', 'customers_phone_unique')) {
                $table->dropUnique('customers_phone_unique');
            }

            if (! Schema::hasIndex('customers', 'customers_company_email_unique')) {
                $table->unique(['company_id', 'email'], 'customers_company_email_unique');
            }
            if (! Schema::hasIndex('customers', 'customers_company_dni_unique')) {
                $table->unique(['company_id', 'dni'], 'customers_company_dni_unique');
            }
            if (! Schema::hasIndex('customers', 'customers_company_phone_unique')) {
                $table->unique(['company_id', 'phone'], 'customers_company_phone_unique');
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasIndex('products', 'uq_product_slug')) {
                $table->dropUnique('uq_product_slug');
            }
            if (! Schema::hasIndex('products', 'products_company_slug_unique')) {
                $table->unique(['company_id', 'slug'], 'products_company_slug_unique');
            }
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            if (Schema::hasIndex('customers', 'customers_company_email_unique')) {
                $table->dropUnique('customers_company_email_unique');
            }
            if (Schema::hasIndex('customers', 'customers_company_dni_unique')) {
                $table->dropUnique('customers_company_dni_unique');
            }
            if (Schema::hasIndex('customers', 'customers_company_phone_unique')) {
                $table->dropUnique('customers_company_phone_unique');
            }

            if (! Schema::hasIndex('customers', 'uq_customer_email')) {
                $table->unique('email', 'uq_customer_email');
            }
            if (! Schema::hasIndex('customers', 'customers_dni_unique')) {
                $table->unique('dni', 'customers_dni_unique');
            }
            if (! Schema::hasIndex('customers', 'customers_phone_unique')) {
                $table->unique('phone', 'customers_phone_unique');
            }
        });

        Schema::table('products', function (Blueprint $table): void {
            if (Schema::hasIndex('products', 'products_company_slug_unique')) {
                $table->dropUnique('products_company_slug_unique');
            }
            if (! Schema::hasIndex('products', 'uq_product_slug')) {
                $table->unique('slug', 'uq_product_slug');
            }
        });
    }
};
