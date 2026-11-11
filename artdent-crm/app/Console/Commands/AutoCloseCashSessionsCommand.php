<?php

namespace App\Console\Commands;

use App\Models\CashRegisterSetting;
use App\Models\CashSession;
use App\Models\Tenant;
use App\Services\CashSessionService;
use Illuminate\Console\Command;

class AutoCloseCashSessionsCommand extends Command
{
    protected $signature = 'cash:auto-close';

    protected $description = 'Cierra automáticamente las sesiones de caja que superaron el horario de cierre programado';

    public function handle(CashSessionService $service): int
    {
        $tenants = collect();

        if (class_exists(Tenant::class)) {
            try {
                $connection = (new Tenant)->getConnectionName() ?? config('tenancy.database.central_connection', 'central');
                if (\Illuminate\Support\Facades\Schema::connection($connection)->hasTable('tenants')) {
                    $tenants = Tenant::all();
                }
            } catch (\Throwable) {
                $tenants = collect();
            }
        }

        if ($tenants->isNotEmpty()) {
            foreach ($tenants as $tenant) {
                $tenant->run(function () use ($service) {
                    $this->processAutoCloseForCurrentTenant($service);
                });
            }
        } else {
            $this->processAutoCloseForCurrentTenant($service);
        }

        return Command::SUCCESS;
    }

    public function processAutoCloseForCurrentTenant(CashSessionService $service): int
    {
        $settings = CashRegisterSetting::query()
            ->where('is_enabled', true)
            ->where('close_mode', 'auto')
            ->get();

        $closedCount = 0;

        foreach ($settings as $setting) {
            $companyId = $setting->company_id;

            $openSessions = CashSession::query()
                ->where('status', 'open')
                ->whereHas('cash_drawer', fn ($q) => $q->where('company_id', $companyId))
                ->with(['cash_drawer', 'user'])
                ->get();

            foreach ($openSessions as $session) {
                if ($service->isSessionExpired($session, $setting)) {
                    $report = $service->buildReport($session);
                    $closingAmount = (float) $report['expected_cash'];

                    $service->closeSession(
                        $session,
                        $closingAmount,
                        customNotes: 'Cierre automático del sistema al superar el horario de corte',
                        isAutomatic: true,
                        scheduledTime: $setting->close_time ?: '00:00'
                    );

                    $this->info("Sesión #{$session->id} de {$session->cash_drawer?->name} cerrada automáticamente (Empresa #{$companyId}).");
                    $closedCount++;
                }
            }
        }

        return $closedCount;
    }
}
