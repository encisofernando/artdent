<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE ecommerce_orders MODIFY COLUMN payment_status ENUM('pending','paid','failed','refunded','refund_failed') NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE ecommerce_orders MODIFY COLUMN payment_status ENUM('pending','paid','failed','refunded') NULL");
    }
};
