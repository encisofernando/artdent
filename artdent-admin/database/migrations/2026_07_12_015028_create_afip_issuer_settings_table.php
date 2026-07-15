<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Fila única (singleton): identidad AFIP con la que ArtCode factura la
        // suscripción SaaS a sus tenants — separada de la identidad AFIP propia
        // de cada tenant (esa vive en la tabla `companies` de cada BD de tenant).
        Schema::create('afip_issuer_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('cuit', 20);
            $table->enum('iva_condition', ['responsable_inscripto', 'monotributista', 'exento'])->default('responsable_inscripto');
            $table->unsignedSmallInteger('point_sale')->default(1);
            $table->enum('environment', ['homo', 'prod'])->default('homo');
            $table->string('cert_path')->nullable();
            $table->string('homo_cert_path')->nullable();
            $table->string('key_path')->nullable();
            $table->boolean('auto_invoice')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('afip_issuer_settings');
    }
};
