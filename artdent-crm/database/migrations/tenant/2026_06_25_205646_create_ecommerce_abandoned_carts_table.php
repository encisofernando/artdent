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
        Schema::create('ecommerce_abandoned_carts', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id')->default(1)->index();
            $table->string('email')->index();
            $table->json('cart_json');
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('recovered_at')->nullable();
            $table->timestamps();

            $table->index(['email', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ecommerce_abandoned_carts');
    }
};
