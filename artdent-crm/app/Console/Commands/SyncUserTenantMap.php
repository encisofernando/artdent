<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncUserTenantMap extends Command
{
    protected $signature = 'tenant:sync-user-map
                            {--fresh : Truncate the map before syncing}';

    protected $description = 'Populate user_tenant_map from all tenant databases';

    public function handle(): int
    {
        $centralConnection = config('tenancy.database.central_connection');

        if ($this->option('fresh')) {
            DB::connection($centralConnection)->table('user_tenant_map')->truncate();
            $this->info('Map truncated.');
        }

        $tenants = Tenant::all();
        $total = 0;

        foreach ($tenants as $tenant) {
            tenancy()->initialize($tenant);

            $emails = DB::table('users')->pluck('email');

            tenancy()->end();

            $rows = $emails->map(fn (string $email) => [
                'email' => $email,
                'tenant_id' => $tenant->id,
                'created_at' => now(),
                'updated_at' => now(),
            ])->all();

            foreach ($rows as $row) {
                DB::connection($centralConnection)
                    ->table('user_tenant_map')
                    ->updateOrInsert(['email' => $row['email']], $row);
            }

            $count = count($rows);
            $total += $count;
            $this->line("  tenant:{$tenant->id} → {$count} users synced");
        }

        $this->info("Done. {$total} email(s) mapped.");

        return self::SUCCESS;
    }
}
