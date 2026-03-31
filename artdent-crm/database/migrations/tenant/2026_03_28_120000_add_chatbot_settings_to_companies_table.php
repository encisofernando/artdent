<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->boolean('chatbot_enabled')->default(true)->after('email_payment_body');
            $table->string('chatbot_provider', 30)->nullable()->after('chatbot_enabled');
            $table->string('chatbot_model', 120)->nullable()->after('chatbot_provider');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn([
                'chatbot_enabled',
                'chatbot_provider',
                'chatbot_model',
            ]);
        });
    }
};
