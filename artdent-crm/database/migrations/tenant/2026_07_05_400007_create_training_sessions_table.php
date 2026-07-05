<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_sessions', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('training_id');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('location')->nullable();
            $table->unsignedSmallInteger('capacity')->nullable();
            $table->timestamps();

            $table->foreign('training_id')->references('id')->on('trainings')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_sessions');
    }
};
