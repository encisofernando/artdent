<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedInteger('width_cm')->nullable()->after('weight');
            $table->unsignedInteger('height_cm')->nullable()->after('width_cm');
            $table->unsignedInteger('depth_cm')->nullable()->after('height_cm');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['width_cm', 'height_cm', 'depth_cm']);
        });
    }
};
