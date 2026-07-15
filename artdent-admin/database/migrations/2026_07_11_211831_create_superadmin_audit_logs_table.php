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
        Schema::create('superadmin_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('actor_email')->nullable(); // snapshot: sobrevive si se borra el usuario
            $table->string('action'); // ej: tenant.created, tenant.suspended, tenant.deleted
            $table->string('tenant_id')->nullable(); // sin FK: debe sobrevivir al borrado físico del tenant
            $table->string('tenant_name')->nullable(); // snapshot: sobrevive al borrado del tenant
            $table->json('changes')->nullable();
            $table->text('note')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'created_at']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('superadmin_audit_logs');
    }
};
