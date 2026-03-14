<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE sales MODIFY COLUMN status ENUM('draft','completed','cancelled','refunded','confirmed','paid','invoiced','pending') NOT NULL DEFAULT 'completed'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE sales MODIFY COLUMN status ENUM('draft','completed','cancelled','refunded','confirmed','paid','invoiced') NOT NULL DEFAULT 'completed'");
    }
};
