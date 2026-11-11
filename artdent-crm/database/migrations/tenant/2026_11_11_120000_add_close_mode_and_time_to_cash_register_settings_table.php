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
        Schema::table('cash_register_settings', function (Blueprint $table) {
            $table->string('close_mode', 20)->default('auto')->after('is_enabled');
            $table->string('close_time', 5)->default('00:00')->after('close_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cash_register_settings', function (Blueprint $table) {
            $table->dropColumn(['close_mode', 'close_time']);
        });
    }
};
