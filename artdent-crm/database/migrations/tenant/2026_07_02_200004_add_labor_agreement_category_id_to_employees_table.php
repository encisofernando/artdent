<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->unsignedBigInteger('labor_agreement_category_id')->nullable()->after('supervisor_id');
            $table->foreign('labor_agreement_category_id')->references('id')->on('labor_agreement_categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table): void {
            $table->dropForeign(['labor_agreement_category_id']);
            $table->dropColumn('labor_agreement_category_id');
        });
    }
};
