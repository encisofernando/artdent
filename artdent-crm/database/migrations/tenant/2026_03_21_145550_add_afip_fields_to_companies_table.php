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
        Schema::table('companies', function (Blueprint $table): void {
            $table->string('afip_cert_path')->nullable()->after('afip_point_sale');
            $table->string('afip_key_path')->nullable()->after('afip_cert_path');
            $table->enum('afip_environment', ['homo', 'prod'])->default('homo')->after('afip_key_path');
            $table->boolean('afip_auto_invoice')->default(false)->after('afip_environment');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn(['afip_cert_path', 'afip_key_path', 'afip_environment', 'afip_auto_invoice']);
        });
    }
};
