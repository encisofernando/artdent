<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE sales MODIFY COLUMN sale_type ENUM('pos','lab_supply','ecommerce') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE sales MODIFY COLUMN sale_type ENUM('pos','lab_supply') NULL");
    }
};
