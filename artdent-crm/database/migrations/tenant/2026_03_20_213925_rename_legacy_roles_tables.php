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
        // Rename roles table to legacy_roles
        if (Schema::hasTable('roles') && ! Schema::hasTable('legacy_roles')) {
            Schema::rename('roles', 'legacy_roles');
        }

        // Rename role_user table to legacy_role_user
        if (Schema::hasTable('role_user') && ! Schema::hasTable('legacy_role_user')) {
            Schema::rename('role_user', 'legacy_role_user');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('legacy_roles') && ! Schema::hasTable('roles')) {
            Schema::rename('legacy_roles', 'roles');
        }

        if (Schema::hasTable('legacy_role_user') && ! Schema::hasTable('role_user')) {
            Schema::rename('legacy_role_user', 'role_user');
        }
    }
};
