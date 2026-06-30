<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE stock_movements MODIFY COLUMN type ENUM('in','out','adjustment','transfer_in','transfer_out','purchase','purchase_reversal','lab_withdrawal','lab_withdrawal_reversal') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE stock_movements MODIFY COLUMN type ENUM('in','out','adjustment','transfer_in','transfer_out','purchase','purchase_reversal') NOT NULL");
    }
};
