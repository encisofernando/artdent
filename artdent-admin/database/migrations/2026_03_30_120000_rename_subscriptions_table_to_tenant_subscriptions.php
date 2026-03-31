<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('subscriptions') && ! Schema::hasTable('tenant_subscriptions')) {
            Schema::rename('subscriptions', 'tenant_subscriptions');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('tenant_subscriptions') && ! Schema::hasTable('subscriptions')) {
            Schema::rename('tenant_subscriptions', 'subscriptions');
        }
    }
};
