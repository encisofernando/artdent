<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payroll_concepts', function (Blueprint $table): void {
            $table->enum('category', ['seguridad_social', 'obra_social', 'sindical', 'art', 'inssjp', 'seguro_vida', 'otros'])
                ->nullable()
                ->after('type');
        });
    }

    public function down(): void
    {
        Schema::table('payroll_concepts', function (Blueprint $table): void {
            $table->dropColumn('category');
        });
    }
};
