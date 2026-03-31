<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')->unique()->constrained()->cascadeOnDelete();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->decimal('balance', 12, 2)->default(0); // positivo = debemos al proveedor
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_accounts');
    }
};
