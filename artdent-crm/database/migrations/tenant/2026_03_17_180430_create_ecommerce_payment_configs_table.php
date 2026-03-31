<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ecommerce_payment_configs', function (Blueprint $table): void {
            $table->id();
            $table->string('type', 30)->unique();  // mercadopago | bank_transfer | qr | cash
            $table->string('label', 100);
            $table->boolean('is_enabled')->default(false);
            $table->json('config')->nullable();    // credentials / account details / QR url
            $table->text('instructions')->nullable();
            $table->unsignedTinyInteger('sort_order')->default(0);
            $table->timestamps();
        });

        // Seed the 4 default methods
        DB::table('ecommerce_payment_configs')->insert([
            ['type' => 'mercadopago',   'label' => 'MercadoPago',             'is_enabled' => false, 'config' => null, 'instructions' => null, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'bank_transfer', 'label' => 'Transferencia CBU / CVU', 'is_enabled' => false, 'config' => null, 'instructions' => null, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'qr',            'label' => 'Pago por QR',             'is_enabled' => false, 'config' => null, 'instructions' => null, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['type' => 'cash',          'label' => 'Efectivo en sucursal',    'is_enabled' => false, 'config' => null, 'instructions' => null, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('ecommerce_payment_configs');
    }
};
