<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaborator_webauthn_credentials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('collaborator_id')->constrained('collaborators')->cascadeOnDelete();
            $table->text('credential_id');
            $table->text('public_key');
            $table->unsignedBigInteger('sign_count')->default(0);
            $table->string('device_label')->nullable();
            $table->string('user_handle')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaborator_webauthn_credentials');
    }
};
