<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class TenantProvisioningService
{
    /**
     * @return array{tenant: \App\Models\Tenant, database: string, domain: string, owner_email: string, generated_password: ?string}
     */
    public function provision(array $data): array
    {
        $companyName = trim((string) ($data['name'] ?? ''));
        $contactEmail = $this->normalizeEmail($data['email'] ?? null);
        $ownerName = trim((string) ($data['owner_name'] ?? ''));
        $ownerEmail = $this->normalizeEmail($data['owner_email'] ?? null);
        $slug = $this->resolveSlug($data['id'] ?? null);
        $domain = $this->resolveDomain($data['domain'] ?? null, $slug);
        $plan = $this->resolvePlan((string) ($data['plan'] ?? 'starter'));
        $status = $this->resolveStatus($data['status'] ?? null, $plan);
        $password = trim((string) ($data['owner_password'] ?? '')) ?: Str::password(16);
        $generatedPassword = trim((string) ($data['owner_password'] ?? '')) === '' ? $password : null;
        $database = $this->databaseName($slug);
        $trialEndsAt = $status === 'trial' ? now()->addDays(max(0, (int) $plan->trial_days)) : null;
        $activatedAt = $status === 'active' ? now() : null;

        $this->ensureTenantIsAvailable($slug, $domain, $ownerEmail);

        $tenant = null;

        try {
            $tenant = Tenant::create([
                'id' => $slug,
                'name' => $companyName,
                'email' => $contactEmail ?: $ownerEmail,
                'plan' => $plan->slug,
                'status' => $status,
                'trial_ends_at' => $trialEndsAt,
                'activated_at' => $activatedAt,
                'data' => [
                    'database' => $database,
                    'primary_domain' => $domain,
                    'owner_name' => $ownerName,
                    'owner_email' => $ownerEmail,
                ],
            ]);

            DB::connection(config('tenancy.database.central_connection'))->table('domains')->insert([
                'tenant_id' => $tenant->getTenantKey(),
                'domain' => $domain,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->prepareTenantDatabase($tenant);
            $this->bootstrapTenantDatabase($tenant, [
                'company_name' => $companyName,
                'owner_name' => $ownerName,
                'owner_email' => $ownerEmail,
                'owner_password' => $password,
            ]);

            DB::connection(config('tenancy.database.central_connection'))->table('user_tenant_map')->updateOrInsert(
                ['email' => $ownerEmail],
                ['tenant_id' => $tenant->id, 'created_at' => now(), 'updated_at' => now()],
            );

            return [
                'tenant' => $tenant->fresh(),
                'database' => $database,
                'domain' => $domain,
                'owner_email' => $ownerEmail,
                'generated_password' => $generatedPassword,
            ];
        } catch (\Throwable $e) {
            $this->cleanupFailedProvision($tenant?->getTenantKey() ?? $slug, $database, $ownerEmail);

            throw $e;
        } finally {
            if (tenancy()->initialized) {
                tenancy()->end();
            }
        }
    }

    private function prepareTenantDatabase(Tenant $tenant): void
    {
        tenancy()->initialize($tenant);

        $schemaPath = $this->tenantSchemaPath();

        if (! File::exists($schemaPath)) {
            throw ValidationException::withMessages([
                'id' => ["No se encontro el schema base del tenant en: {$schemaPath}"],
            ]);
        }

        $schemaSql = File::get($schemaPath);

        if (trim($schemaSql) === '') {
            throw ValidationException::withMessages([
                'id' => ['El schema base del tenant esta vacio.'],
            ]);
        }

        DB::connection('tenant')->unprepared($schemaSql);
        $this->ensureInfrastructureTables();
    }

    private function bootstrapTenantDatabase(Tenant $tenant, array $payload): void
    {
        tenancy()->initialize($tenant);

        DB::connection('tenant')->transaction(function () use ($payload): void {
            $companyId = DB::connection('tenant')->table('companies')->insertGetId([
                'name' => $payload['company_name'],
                'fantasy_name' => $payload['company_name'],
                'email' => $payload['owner_email'],
                'country' => 'Argentina',
                'currency' => 'ARS',
                'timezone' => 'America/Argentina/Buenos_Aires',
                'iva_condition' => 'responsable_inscripto',
                'afip_point_sale' => 1,
                'afip_environment' => 'homo',
                'afip_auto_invoice' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                'company_id' => $companyId,
                'name' => 'Casa Central',
                'code' => 'MAIN',
                'email' => $payload['owner_email'],
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::connection('tenant')->table('warehouses')->insert([
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'name' => 'Deposito Principal',
                'code' => 'MAIN',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $userId = DB::connection('tenant')->table('users')->insertGetId([
                'company_id' => $companyId,
                'branch_id' => $branchId,
                'name' => $payload['owner_name'],
                'email' => $payload['owner_email'],
                'password' => Hash::make($payload['owner_password']),
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->seedPermissions();
            $roleId = $this->seedSuperAdminRole();

            DB::connection('tenant')->table('model_has_roles')->updateOrInsert([
                'role_id' => $roleId,
                'model_type' => 'App\\Models\\User',
                'model_id' => $userId,
            ], []);
        });
    }

    private function seedPermissions(): void
    {
        $modules = [
            'users' => 'Usuarios',
            'roles' => 'Roles y Permisos',
            'settings' => 'Configuración',
            'customers' => 'Clientes',
            'products' => 'Productos e Inventario',
            'orders' => 'Órdenes (Laboratorio)',
            'ecommerce' => 'E-commerce / Ventas',
            'reports' => 'Reportes y Estadísticas',
            'branches' => 'Sucursales',
            'staff' => 'Personal y RRHH',
        ];

        $actions = ['view', 'create', 'edit', 'delete'];

        foreach ($modules as $moduleKey => $label) {
            foreach ($actions as $action) {
                DB::connection('tenant')->table('permissions')->updateOrInsert([
                    'name' => "{$moduleKey}.{$action}",
                    'guard_name' => 'web',
                ], [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    private function seedSuperAdminRole(): int
    {
        $role = DB::connection('tenant')->table('roles')->where('name', 'Super Admin')->where('guard_name', 'web')->first();

        if (! $role) {
            $roleId = DB::connection('tenant')->table('roles')->insertGetId([
                'name' => 'Super Admin',
                'display_name' => 'Super Administrador',
                'description' => 'Acceso total e irrestricto a todos los módulos y configuraciones del sistema.',
                'guard_name' => 'web',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            $roleId = $role->id;
        }

        $permissionIds = DB::connection('tenant')->table('permissions')->pluck('id');

        foreach ($permissionIds as $permissionId) {
            DB::connection('tenant')->table('role_has_permissions')->updateOrInsert([
                'permission_id' => $permissionId,
                'role_id' => $roleId,
            ], []);
        }

        return $roleId;
    }

    private function ensureTenantIsAvailable(string $slug, string $domain, string $ownerEmail): void
    {
        if (Tenant::query()->whereKey($slug)->exists()) {
            throw ValidationException::withMessages([
                'id' => ['Ese slug ya está registrado.'],
            ]);
        }

        if (DB::connection(config('tenancy.database.central_connection'))->table('domains')->where('domain', $domain)->exists()) {
            throw ValidationException::withMessages([
                'domain' => ['Ese dominio ya está en uso.'],
            ]);
        }

        if (DB::connection(config('tenancy.database.central_connection'))->table('user_tenant_map')->where('email', $ownerEmail)->exists()) {
            throw ValidationException::withMessages([
                'owner_email' => ['Ese email ya está asociado a otro tenant.'],
            ]);
        }
    }

    private function resolvePlan(string $slug): Plan
    {
        $plan = Plan::query()->where('slug', $slug)->where('is_active', true)->first();

        if (! $plan) {
            throw ValidationException::withMessages([
                'plan' => ['El plan seleccionado no existe o no está activo.'],
            ]);
        }

        return $plan;
    }

    private function resolveSlug(mixed $slug): string
    {
        $slug = Str::lower(trim((string) $slug));

        if ($slug === '' || ! preg_match('/^[a-z0-9\-]+$/', $slug)) {
            throw ValidationException::withMessages([
                'id' => ['El slug sólo puede contener minúsculas, números y guiones.'],
            ]);
        }

        return $slug;
    }

    private function resolveDomain(mixed $domain, string $slug): string
    {
        $domain = Str::lower(trim((string) $domain));

        if ($domain !== '') {
            return $domain;
        }

        $suffix = trim((string) config('tenancy.default_domain_suffix', 'artdent.com.ar'));

        return "{$slug}.{$suffix}";
    }

    private function resolveStatus(mixed $status, Plan $plan): string
    {
        if (is_string($status) && in_array($status, ['trial', 'active', 'suspended', 'cancelled'], true)) {
            return $status;
        }

        return ((int) $plan->trial_days) > 0 ? 'trial' : 'active';
    }

    private function normalizeEmail(mixed $email): string
    {
        return Str::lower(trim((string) $email));
    }

    private function databaseName(string $slug): string
    {
        return config('tenancy.database.prefix').$slug.config('tenancy.database.suffix');
    }

    private function cleanupFailedProvision(string $tenantId, string $database, string $ownerEmail): void
    {
        try {
            DB::connection(config('tenancy.database.central_connection'))->table('domains')->where('tenant_id', $tenantId)->delete();
            DB::connection(config('tenancy.database.central_connection'))->table('user_tenant_map')->where('tenant_id', $tenantId)->orWhere('email', $ownerEmail)->delete();
            DB::connection(config('tenancy.database.central_connection'))->table('tenants')->where('id', $tenantId)->delete();
        } catch (\Throwable) {
            // Best-effort central cleanup.
        }

        try {
            $databaseName = str_replace('`', '``', $database);
            DB::statement("DROP DATABASE IF EXISTS `{$databaseName}`");
        } catch (\Throwable) {
            // Best-effort database cleanup.
        }
    }

    private function ensureInfrastructureTables(): void
    {
        if (! Schema::connection('tenant')->hasTable('failed_jobs')) {
            Schema::connection('tenant')->create('failed_jobs', function (Blueprint $table): void {
                $table->id();
                $table->string('uuid')->unique();
                $table->text('connection');
                $table->text('queue');
                $table->longText('payload');
                $table->longText('exception');
                $table->timestamp('failed_at')->useCurrent();
            });
        }
    }

    private function tenantSchemaPath(): string
    {
        $path = (string) config('tenancy.schema_path');

        if ($path === '') {
            throw ValidationException::withMessages([
                'id' => ['La ruta del schema base del tenant no esta configurada.'],
            ]);
        }

        if (Str::startsWith($path, ['/'])) {
            return $path;
        }

        return base_path($path);
    }
}
