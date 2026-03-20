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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('whatsapp_phone_number_id')->nullable()->after('timezone');
            $table->text('whatsapp_access_token')->nullable()->after('whatsapp_phone_number_id');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->string('whatsapp_bsuid')->nullable()->unique()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('whatsapp_bsuid');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_phone_number_id', 'whatsapp_access_token']);
        });
    }
};
