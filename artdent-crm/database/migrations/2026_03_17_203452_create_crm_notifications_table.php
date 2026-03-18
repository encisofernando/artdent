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
        Schema::create('crm_notifications', function (Blueprint $table): void {
            $table->id();
            $table->string('type'); // new_order, payment_approved, new_review, order_cancelled
            $table->string('title');
            $table->string('body');
            $table->string('url')->nullable();
            $table->string('order_code')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('crm_notifications');
    }
};
