<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tariff_phases', function (Blueprint $table) {
            $table->foreignId('phase_template_id')->nullable()->after('tariff_id')
                ->constrained('phase_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tariff_phases', function (Blueprint $table) {
            $table->dropConstrainedForeignId('phase_template_id');
        });
    }
};
