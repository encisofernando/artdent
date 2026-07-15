<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jobs', function (Blueprint $table): void {
            $table->timestamp('commission_processed_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('jobs', function (Blueprint $table): void {
            $table->dropColumn('commission_processed_at');
        });
    }
};
