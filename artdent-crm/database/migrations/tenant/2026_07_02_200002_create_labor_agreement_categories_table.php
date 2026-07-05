<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('labor_agreement_categories', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('labor_agreement_id');
            $table->string('name', 191);
            $table->string('code', 50)->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            $table->foreign('labor_agreement_id')->references('id')->on('labor_agreements')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('labor_agreement_categories');
    }
};
