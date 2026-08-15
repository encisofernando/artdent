<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncIsapiDeviceRegistry extends Command
{
    protected $signature = 'tenant:sync-isapi-registry
                            {--fresh : Truncate the registry before syncing}';

    protected $description = 'Populate isapi_device_registry from all tenant databases (HikVisionDevice rows with connection_type != isup)';

    public function handle(): int
    {
        $centralConnection = config('tenancy.database.central_connection');

        if ($this->option('fresh')) {
            DB::connection($centralConnection)->table('isapi_device_registry')->truncate();
            $this->info('Registry truncated.');
        }

        $tenants = Tenant::all();
        $total = 0;

        foreach ($tenants as $tenant) {
            tenancy()->initialize($tenant);

            $devices = DB::table('hikvision_devices')
                ->where('connection_type', '!=', 'isup')
                ->where(function ($q) {
                    $q->whereNotNull('ip_address')
                        ->orWhereNotNull('mac_address')
                        ->orWhereNotNull('serial_no');
                })
                ->get(['id', 'ip_address', 'mac_address', 'serial_no']);

            tenancy()->end();

            foreach ($devices as $device) {
                DB::connection($centralConnection)
                    ->table('isapi_device_registry')
                    ->updateOrInsert(
                        ['tenant_id' => $tenant->id, 'device_id' => $device->id],
                        [
                            'ip_address' => $device->ip_address,
                            'mac_address' => $device->mac_address,
                            'serial_no' => $device->serial_no,
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );
            }

            $count = count($devices);
            $total += $count;
            $this->line("  tenant:{$tenant->id} → {$count} device(s) synced");
        }

        $this->info("Done. {$total} device(s) mapped.");

        return self::SUCCESS;
    }
}
