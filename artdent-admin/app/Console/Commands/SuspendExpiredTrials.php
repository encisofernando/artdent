<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Support\SuperadminAudit;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:suspend-expired-trials')]
#[Description('Suspende tenants en trial cuyo trial_ends_at ya venció (sin tarjeta cargada, no hay cobro automático que los convierta).')]
class SuspendExpiredTrials extends Command
{
    public function handle(): void
    {
        $expired = Tenant::where('status', 'trial')
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', now())
            ->get();

        foreach ($expired as $tenant) {
            $tenant->update(['status' => 'suspended']);

            SuperadminAudit::log('tenant.suspended', $tenant, [
                'reason' => 'trial_expired',
                'trial_ends_at' => $tenant->trial_ends_at?->toISOString(),
            ], 'Suspendido automáticamente por vencimiento de trial (app:suspend-expired-trials).');
        }

        $this->info("Trials vencidos suspendidos: {$expired->count()}");
    }
}
