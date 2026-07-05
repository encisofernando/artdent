<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('art_providers', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('company_id');
            $table->string('name');
            $table->string('cuit', 20)->nullable();
            $table->string('policy_number', 100)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id');
        });

        Schema::table('employees', function (Blueprint $table): void {
            $table->unsignedBigInteger('art_provider_id')->nullable()->after('hik_employee_no');
            $table->foreign('art_provider_id')->references('id')->on('art_providers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropForeign(['art_provider_id']);
            $table->dropColumn('art_provider_id');
        });

        Schema::dropIfExists('art_providers');
    }
};
