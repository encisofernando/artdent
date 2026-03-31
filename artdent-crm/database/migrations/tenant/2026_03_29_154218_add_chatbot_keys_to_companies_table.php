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
        Schema::table('companies', function (Blueprint $table) {
            $table->string('chatbot_openai_key')->nullable()->after('chatbot_model');
            $table->string('chatbot_gemini_key')->nullable()->after('chatbot_openai_key');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn(['chatbot_openai_key', 'chatbot_gemini_key']);
        });
    }
};
