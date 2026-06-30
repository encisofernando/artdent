<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_phase_progress', function (Blueprint $table) {
            $table->foreignId('tariff_phase_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('job_phase_progress', function (Blueprint $table) {
            $table->foreignId('tariff_phase_id')->nullable(false)->change();
        });
    }
};
