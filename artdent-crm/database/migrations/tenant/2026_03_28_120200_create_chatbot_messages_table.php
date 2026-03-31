<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chatbot_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')->constrained('chatbot_conversations')->cascadeOnDelete();
            $table->string('role', 20);
            $table->longText('content');
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['conversation_id', 'id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chatbot_messages');
    }
};
