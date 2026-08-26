<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lab_account_mp_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dentist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('lab_account_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('external_reference')->unique();
            $table->string('mp_payment_id')->nullable()->unique();
            $table->string('status', 20)->default('pending');
            $table->foreignId('lab_account_move_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_account_mp_payments');
    }
};
