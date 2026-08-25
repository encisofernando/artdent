<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('sales', 'afip_pending_receipt_type')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            // Comprobante AFIP (FA/FB/FC/NCA/...) que la venta debería tener
            // pero no pudo obtenerse por una falla/corte con AFIP — la venta
            // queda como ticket X mientras tanto. El comando programado
            // afip:retry-pending-invoices reintenta mientras este campo no
            // sea null; se limpia al facturar con éxito.
            $table->string('afip_pending_receipt_type', 10)->nullable()->after('receipt_type');
        });
    }

    public function down(): void
    {
        if (! Schema::hasColumn('sales', 'afip_pending_receipt_type')) {
            return;
        }

        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn('afip_pending_receipt_type');
        });
    }
};
