<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncPublicTokenRegistry extends Command
{
    protected $signature = 'tenant:sync-public-tokens
                            {--fresh : Truncate the registry before syncing}';

    protected $description = 'Populate public_token_registry from all tenant databases (Invoice.public_token de presupuestos + Customer.portal_token)';

    public function handle(): int
    {
        $centralConnection = config('tenancy.database.central_connection');

        if ($this->option('fresh')) {
            DB::connection($centralConnection)->table('public_token_registry')->truncate();
            $this->info('Registry truncated.');
        }

        $tenants = Tenant::all();
        $total = 0;

        foreach ($tenants as $tenant) {
            tenancy()->initialize($tenant);

            $quoteTokens = DB::table('invoices')
                ->where('reference_type', 'quote')
                ->whereNotNull('public_token')
                ->pluck('public_token');

            $portalTokens = DB::table('customers')
                ->whereNotNull('portal_token')
                ->pluck('portal_token');

            tenancy()->end();

            $rows = $quoteTokens->map(fn (string $token) => ['token' => $token, 'type' => 'quote'])
                ->concat($portalTokens->map(fn (string $token) => ['token' => $token, 'type' => 'customer_portal']));

            foreach ($rows as $row) {
                DB::connection($centralConnection)
                    ->table('public_token_registry')
                    ->updateOrInsert(
                        ['token' => $row['token']],
                        [
                            'type' => $row['type'],
                            'tenant_id' => $tenant->id,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );
            }

            $count = $rows->count();
            $total += $count;
            $this->line("  tenant:{$tenant->id} → {$count} token(s) synced");
        }

        $this->info("Done. {$total} token(s) mapped.");

        return self::SUCCESS;
    }
}
