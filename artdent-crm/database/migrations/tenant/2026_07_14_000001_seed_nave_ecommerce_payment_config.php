<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('ecommerce_payment_configs')->insertOrIgnore([
            'type' => 'nave',
            'label' => 'Nave (Galicia)',
            'is_enabled' => false,
            'config' => json_encode([
                'sandbox_mode' => true,
                'audience' => 'https://naranja.com/ranty/merchants/api',
            ]),
            'instructions' => 'Pagá con QR o tarjeta vía Nave',
            'sort_order' => 5,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        DB::table('ecommerce_payment_configs')->where('type', 'nave')->delete();
    }
};
