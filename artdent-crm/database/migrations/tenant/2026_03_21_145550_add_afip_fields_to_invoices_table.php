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
        Schema::table('invoices', function (Blueprint $table): void {
            $table->string('environment')->nullable()->default('homo')->after('notes');
            $table->json('afip_request')->nullable()->after('environment');
            $table->json('afip_response')->nullable()->after('afip_request');
            $table->text('afip_observations')->nullable()->after('afip_response');
            $table->string('afip_error_msg')->nullable()->after('afip_observations');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table): void {
            $table->dropColumn(['environment', 'afip_request', 'afip_response', 'afip_observations', 'afip_error_msg']);
        });
    }
};
