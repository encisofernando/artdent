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
        Schema::create('lab_supply_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('collaborator_id')->nullable();
            $table->string('external_person')->nullable();
            $table->enum('status', ['confirmed', 'cancelled'])->default('confirmed');
            $table->decimal('total_cost', 12, 2)->default(0);
            $table->date('withdrawn_at');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('warehouse_id')->references('id')->on('warehouses');
            $table->foreign('user_id')->references('id')->on('users');
            $table->foreign('collaborator_id')->references('id')->on('collaborators');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lab_supply_withdrawals');
    }
};
