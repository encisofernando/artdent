<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'pricing_mode')) {
                $table->string('pricing_mode', 10)->default('b2c')->after('password');
            }
            if (!Schema::hasColumn('users', 'b2b_discount_percent')) {
                $table->decimal('b2b_discount_percent', 5, 2)->nullable()->after('pricing_mode');
            }
        });

        Schema::table('companies', function (Blueprint $table) {
            if (!Schema::hasColumn('companies', 'b2b_discount_percent')) {
                $table->decimal('b2b_discount_percent', 5, 2)->default(0)->after('email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'b2b_discount_percent')) {
                $table->dropColumn('b2b_discount_percent');
            }
            if (Schema::hasColumn('users', 'pricing_mode')) {
                $table->dropColumn('pricing_mode');
            }
        });
        Schema::table('companies', function (Blueprint $table) {
            if (Schema::hasColumn('companies', 'b2b_discount_percent')) {
                $table->dropColumn('b2b_discount_percent');
            }
        });
    }
};
