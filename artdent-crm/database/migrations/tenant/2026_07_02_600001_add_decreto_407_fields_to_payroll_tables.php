<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Campos requeridos por el Decreto 407/2026 (reglamentario de la Ley 27.802),
 * publicado en el Boletín Oficial el 01/06/2026, Anexo I art. 5 y Anexo III
 * (modelo oficial de recibo de sueldo):
 * - Cada concepto debe indicar "su base de cálculo, unidad de medida y monto
 *   resultante" -> employee_receipt_lines.base_amount / rate.
 * - El resumen gráfico de composición del costo laboral debe agrupar, como
 *   mínimo, en: sindical, seguridad social, obra social, INSSJP, ART, cámaras
 *   o entidades empresariales, otros rubros -> se agrega 'camaras_empresariales'
 *   a payroll_concepts.category.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_receipt_lines', function (Blueprint $table): void {
            $table->decimal('base_amount', 12, 2)->nullable()->after('amount');
            $table->decimal('rate', 8, 4)->nullable()->after('base_amount');
        });

        DB::statement("ALTER TABLE payroll_concepts MODIFY category ENUM('seguridad_social','obra_social','sindical','art','inssjp','seguro_vida','camaras_empresariales','otros') NULL");
    }

    public function down(): void
    {
        Schema::table('employee_receipt_lines', function (Blueprint $table): void {
            $table->dropColumn(['base_amount', 'rate']);
        });

        DB::statement("ALTER TABLE payroll_concepts MODIFY category ENUM('seguridad_social','obra_social','sindical','art','inssjp','seguro_vida','otros') NULL");
    }
};
