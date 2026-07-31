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
        Schema::create('nave_installment_rates', function (Blueprint $table) {
            $table->id();
            $table->string('bank', 20); // galicia | naranja | otros_bancos
            $table->string('card_brand', 20); // visa | mastercard | amex
            $table->string('card_type', 10); // credit | debit
            $table->unsignedTinyInteger('installments');
            $table->decimal('rate_pct', 6, 2); // ej. 7.64 = 7.64%
            $table->string('tier_label')->nullable(); // ej. "Cuotas Nave" cuando hay más de una tasa para la misma cantidad de cuotas
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['bank', 'card_brand', 'card_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nave_installment_rates');
    }
};
