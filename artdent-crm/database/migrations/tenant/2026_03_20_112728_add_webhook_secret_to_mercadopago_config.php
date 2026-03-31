<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $mpConfig = DB::table('ecommerce_payment_configs')->where('type', 'mercadopago')->first();
        if ($mpConfig && $mpConfig->config) {
            $config = json_decode($mpConfig->config, true) ?? [];
            if (! isset($config['webhook_secret'])) {
                $config['webhook_secret'] = '';
                DB::table('ecommerce_payment_configs')
                    ->where('id', $mpConfig->id)
                    ->update(['config' => json_encode($config)]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $mpConfig = DB::table('ecommerce_payment_configs')->where('type', 'mercadopago')->first();
        if ($mpConfig && $mpConfig->config) {
            $config = json_decode($mpConfig->config, true) ?? [];
            if (isset($config['webhook_secret'])) {
                unset($config['webhook_secret']);
                DB::table('ecommerce_payment_configs')
                    ->where('id', $mpConfig->id)
                    ->update(['config' => json_encode($config)]);
            }
        }
    }
};
