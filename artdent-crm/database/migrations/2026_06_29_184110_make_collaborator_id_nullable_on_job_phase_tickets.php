<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_phase_tickets', function (Blueprint $table) {
            $table->foreignId('collaborator_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('job_phase_tickets', function (Blueprint $table) {
            $table->foreignId('collaborator_id')->nullable(false)->change();
        });
    }
};
