<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_carrier_configs', function (Blueprint $table) {
            $table->id();
            $table->string('type', 30)->unique();
            $table->string('label', 100);
            $table->boolean('is_enabled')->default(false);
            $table->json('config')->nullable();
            $table->timestamps();
        });

        DB::table('shipping_carrier_configs')->insert([
            'type' => 'andreani',
            'label' => 'Andreani',
            'is_enabled' => false,
            'config' => json_encode([
                'hash_andreani' => null,
                'cp_origen' => null,
                'sandbox_mode' => true,
                // Se completan solos la primera vez que el login contra la
                // API responde bien — ver AndreaniService::clientInfo().
                'client_type' => null,
                'contratos' => null,
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_carrier_configs');
    }
};
