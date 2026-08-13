<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

/**
 * Sólo para tests. `plans`/`modules`/`plan_modules` viven en la conexión
 * 'central' (compartida con artdent-admin, otro codebase) sin migración
 * en este repo — TenantModuleResolver las consulta en cualquier request
 * autenticado en modo owner (vía HandleInertiaRequests).
 *
 * Corre como parte de "migrate:fresh --seeder=..." (ver
 * Tests\Concerns\RefreshesTenantSchema), es decir ANTES de que
 * RefreshDatabase abra la transacción por-test — si esto corriera
 * *dentro* de esa transacción, el CREATE TABLE (DDL) haría commit
 * implícito y rompería el rollback del primer test que se ejecute.
 */
class TestCentralTablesSeeder extends Seeder
{
    public function run(): void
    {
        $central = Schema::connection('central');

        if (! $central->hasTable('plans')) {
            $central->create('plans', function (Blueprint $table): void {
                $table->id();
                $table->string('slug')->unique();
                $table->string('name');
                $table->decimal('price', 10, 2)->default(0);
                $table->unsignedInteger('trial_days')->default(0);
                $table->boolean('is_active')->default(true);
                $table->boolean('is_public')->default(true);
                $table->string('mp_plan_id')->nullable();
                $table->unsignedInteger('max_users')->nullable();
                $table->unsignedInteger('max_products')->nullable();
                $table->unsignedInteger('max_sales_per_month')->nullable();
                $table->unsignedInteger('max_chat_messages_per_month')->nullable();
                $table->json('features')->nullable();
                $table->timestamps();
            });
        }

        if (! $central->hasTable('modules')) {
            $central->create('modules', function (Blueprint $table): void {
                $table->id();
                $table->string('slug')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('icon')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! $central->hasTable('plan_modules')) {
            $central->create('plan_modules', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
                $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        Plan::on('central')->firstOrCreate(
            ['slug' => 'owner'],
            ['name' => 'Owner (test)', 'is_active' => true, 'is_public' => false]
        );
    }
}
