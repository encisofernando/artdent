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
            $table->string('whatsapp_contact_number', 30)->nullable()->after('whatsapp_message_template');
            $table->string('ga4_measurement_id', 50)->nullable()->after('whatsapp_contact_number');
            $table->string('meta_pixel_id', 30)->nullable()->after('ga4_measurement_id');
            $table->string('hotjar_id', 20)->nullable()->after('meta_pixel_id');
            $table->string('google_tag_manager_id', 20)->nullable()->after('hotjar_id');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn([
                'whatsapp_contact_number',
                'ga4_measurement_id',
                'meta_pixel_id',
                'hotjar_id',
                'google_tag_manager_id',
            ]);
        });
    }
};
