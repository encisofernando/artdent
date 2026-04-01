<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('companies', 'chatbot_gemini_key')) {
            return;
        }

        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn('chatbot_gemini_key');
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('companies', 'chatbot_gemini_key')) {
            return;
        }

        Schema::table('companies', function (Blueprint $table): void {
            $table->string('chatbot_gemini_key')->nullable()->after('chatbot_openai_key');
        });
    }
};
