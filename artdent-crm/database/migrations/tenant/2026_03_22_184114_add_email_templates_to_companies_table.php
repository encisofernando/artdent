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
        Schema::table('companies', function (Blueprint $table): void {
            $table->string('email_sale_subject')->nullable()->after('whatsapp_message_template');
            $table->text('email_sale_body')->nullable()->after('email_sale_subject');
            $table->string('email_quote_subject')->nullable()->after('email_sale_body');
            $table->text('email_quote_body')->nullable()->after('email_quote_subject');
            $table->string('email_payment_subject')->nullable()->after('email_quote_body');
            $table->text('email_payment_body')->nullable()->after('email_payment_subject');
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table): void {
            $table->dropColumn([
                'email_sale_subject', 'email_sale_body',
                'email_quote_subject', 'email_quote_body',
                'email_payment_subject', 'email_payment_body',
            ]);
        });
    }
};
