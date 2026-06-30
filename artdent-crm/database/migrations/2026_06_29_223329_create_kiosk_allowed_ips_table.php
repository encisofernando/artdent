<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('kiosk_allowed_ips', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('ip_address'); // IP simple o CIDR (ej: 192.168.1.50 o 192.168.1.0/24)
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kiosk_allowed_ips');
    }
};
