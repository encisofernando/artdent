<?php

namespace App\Console\Commands;

use App\Services\MercadoPagoReportService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ManageMercadoPagoReports extends Command
{
    protected $signature = 'mp:report 
                            {action : generate, list, status} 
                            {--start= : YYYY-MM-DD} 
                            {--end= : YYYY-MM-DD} 
                            {--file= : Filename for status}';

    protected $description = 'Manage Mercado Pago Releases (Liquidaciones) Reports';

    public function handle(MercadoPagoReportService $service)
    {
        $action = $this->argument('action');

        try {
            switch ($action) {
                case 'generate':
                    $start = Carbon::parse($this->option('start') ?? now()->subDays(7)->toDateString());
                    $end = Carbon::parse($this->option('end') ?? now()->toDateString());

                    $this->info("Requesting report from {$start->toDateString()} to {$end->toDateString()}...");
                    $result = $service->generateReleasesReport($start, $end);

                    $this->info('Report Requested! ID: '.($result['id'] ?? 'N/A'));
                    $this->info("Note: It may take a few minutes to appear in 'list'.");
                    $this->line(json_encode($result, JSON_PRETTY_PRINT));
                    break;

                case 'list':
                    $this->info('Fetching reports list...');
                    $result = $service->listReports();
                    if (empty($result)) {
                        $this->warn('No reports found. If you just generated one, please wait a few minutes.');
                    } else {
                        $this->table(['File Name', 'Created'], $result);
                    }
                    break;

                case 'status':
                    $file = $this->option('file');
                    if (! $file) {
                        $this->error('Please provide --file=FILENAME');

                        return;
                    }
                    $this->info("Checking status for File: {$file}...");
                    $result = $service->getReportStatus($file);
                    $this->line(json_encode($result, JSON_PRETTY_PRINT));
                    break;
            }
        } catch (\Exception $e) {
            $this->error('Error: '.$e->getMessage());
        }
    }
}
