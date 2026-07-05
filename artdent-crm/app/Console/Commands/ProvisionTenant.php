<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class ProvisionTenant extends Command
{
    protected $signature = 'tenant:provision
                            {slug : Identificador único del tenant (ej: dev)}
                            {--name= : Nombre de la empresa}
                            {--email= : Email de contacto}
                            {--plan=starter : Plan (starter|pro|enterprise)}
                            {--domain= : Dominio personalizado (por defecto: {slug}.artdent.com.ar)}
                            {--seed : Ejecutar seeders después de migrar}';

    protected $description = 'Provisiona un nuevo tenant: crea la base de datos y ejecuta migraciones.';

    public function handle(): int
    {
        $slug = $this->argument('slug');

        $validator = Validator::make(['slug' => $slug], [
            'slug' => ['required', 'string', 'max:50', 'regex:/^[a-z0-9\-]+$/'],
        ]);

        if ($validator->fails()) {
            $this->error('El slug solo puede contener letras minúsculas, números y guiones.');

            return self::FAILURE;
        }

        if (Tenant::find($slug)) {
            $this->error("El tenant [{$slug}] ya existe.");

            return self::FAILURE;
        }

        $name = $this->option('name') ?? $this->ask('Nombre de la empresa');
        $email = $this->option('email') ?? $this->ask('Email de contacto (opcional)', '');
        $plan = $this->option('plan');
        $domain = $this->option('domain') ?? "{$slug}.artdent.com.ar";

        try {
            $this->info("Creando tenant [{$slug}]...");

            $tenant = Tenant::create([
                'id' => $slug,
                'name' => $name,
                'email' => $email ?: null,
                'plan' => $plan,
                'status' => 'trial',
                'trial_ends_at' => now()->addDays(14),
            ]);

            $tenant->domains()->create(['domain' => $domain]);

            $databaseName = config('tenancy.database.prefix').$slug.config('tenancy.database.suffix');

            $this->info("✅ Base de datos creada: {$databaseName}");
            $this->info("✅ Dominio registrado: {$domain}");
            $this->info("✅ Tenant [{$slug}] listo — plan: {$plan}, trial hasta: ".now()->addDays(14)->format('d/m/Y'));

            if ($this->option('seed')) {
                $this->info('Ejecutando seeders del tenant...');
                tenancy()->initialize($tenant);
                $this->call('db:seed', ['--class' => 'RolePermissionSeeder']);
                $this->call('db:seed', ['--class' => 'PayrollSystemVariablesSeeder']);
                $this->call('db:seed', ['--class' => 'LeaveTypesSeeder']);
                tenancy()->end();
            }

            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
