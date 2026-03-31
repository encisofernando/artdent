<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('income_records', function (Blueprint $table) {
            $table->string('scope', 30)->nullable()->after('company_id')->index();
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->string('scope', 30)->nullable()->after('company_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('income_records', function (Blueprint $table) {
            $table->dropColumn('scope');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropColumn('scope');
        });
    }
};
