<?php

namespace Tests\Concerns;

use Illuminate\Foundation\Testing\RefreshDatabase;

/**
 * RefreshDatabase corre "migrate:fresh" con database/migrations/ solo por
 * default. El schema real de este proyecto (users, companies, sales, etc.)
 * vive en database/migrations/tenant/ (mismo --path que usa
 * config('tenancy.migration_parameters') en producción), y buena parte
 * del schema más viejo (ej. `sales`) está "squasheado" en
 * database/schema/mysql-schema.sql sin migración propia — sin cargar ese
 * dump primero, cualquier migración que ALTERE esas tablas falla con
 * "no such table".
 *
 * TestCentralTablesSeeder corre acá (dentro de migrate:fresh, vía
 * --seeder) y NO en un hook posterior — un CREATE TABLE es DDL, hace
 * commit implícito en MySQL, y si corriera dentro de la transacción
 * por-test que arma RefreshDatabase, rompería el rollback del primer
 * test que se ejecute en todo el proceso (así se filtró un company
 * id=1 "fantasma" entre archivos la primera vez que se probó esto).
 */
trait RefreshesTenantSchema
{
    use RefreshDatabase {
        migrateFreshUsing as protected baseMigrateFreshUsing;
    }

    protected function migrateFreshUsing()
    {
        return array_merge($this->baseMigrateFreshUsing(), [
            '--path' => ['database/migrations', 'database/migrations/tenant'],
            '--realpath' => false,
            '--schema-path' => database_path('schema/mysql-schema.sql'),
            '--seeder' => \Database\Seeders\TestCentralTablesSeeder::class,
        ]);
    }
}
