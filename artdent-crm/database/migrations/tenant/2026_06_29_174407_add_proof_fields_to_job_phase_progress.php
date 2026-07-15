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
        Schema::table('job_phase_progress', function (Blueprint $table) {
            $table->dateTime('proof_sent_at')->nullable()->after('completed_at')->comment('Cuando la fase fue enviada a prueba con el odontólogo');
            $table->dateTime('proof_returned_at')->nullable()->after('proof_sent_at')->comment('Cuando el odontólogo devolvió el trabajo de prueba');
        });
    }

    public function down(): void
    {
        Schema::table('job_phase_progress', function (Blueprint $table) {
            $table->dropColumn(['proof_sent_at', 'proof_returned_at']);
        });
    }
};
